<?php

namespace App\Http\Controllers;

use App\Models\AdminSetting;
use App\Models\SsmVerification;
use Illuminate\Http\Request;
use App\Models\Service;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SsmVerificationController extends Controller
{
    public function viewDocument()
    {
        $verification = SsmVerification::where('user_id', auth()->id())->first();

        if (!$verification || !$verification->document_path) {
            abort(404, 'SSM document not found.');
        }

        $filePath = Storage::disk('public')->path($verification->document_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->file($filePath);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('document')->store('ssm-documents', 'public');

        $verification = SsmVerification::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'document_path' => $path,
                'status' => 'pending',
                'company_name' => null,
                'registration_number' => null,
                'expiry_date' => null,
                'ai_response' => null,
            ]
        );

        // Try OpenAI verification if API key exists
        $apiKey = AdminSetting::get('openai_api_key');
        if ($apiKey) {
            $this->verifyWithAi($verification, $apiKey);
        }

        return back()->with('success', 'SSM document uploaded. Verification is being processed.');
    }

    private function verifyWithAi(SsmVerification $verification, string $apiKey)
    {
        try {
            $filePath = Storage::disk('public')->path($verification->document_path);
            $mimeType = mime_content_type($filePath);
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

            $prompt = 'Extract the following from this SSM (Suruhanjaya Syarikat Malaysia) business certificate: company_name, registration_number, expiry_date (YYYY-MM-DD format). Return JSON only: {"company_name": "...", "registration_number": "...", "expiry_date": "...", "is_valid": true/false}. If not a valid SSM certificate, set is_valid to false.';

            // Build content based on file type
            $content = [['type' => 'text', 'text' => $prompt]];

            if (in_array($extension, ['doc', 'docx'])) {
                // Extract text from DOCX/DOC
                $extractedText = $this->extractTextFromDocx($filePath);
                if ($extractedText) {
                    $content = [['type' => 'text', 'text' => $prompt . "\n\nDocument text content:\n" . $extractedText]];
                } else {
                    $verification->update(['status' => 'failed', 'ai_response' => 'Could not extract text from document.']);
                    return;
                }
            } elseif ($extension === 'pdf') {
                // Send PDF as file content type
                $fileData = base64_encode(file_get_contents($filePath));
                $content[] = [
                    'type' => 'file',
                    'file' => [
                        'filename' => basename($filePath),
                        'file_data' => "data:application/pdf;base64,{$fileData}",
                    ],
                ];
            } else {
                // Images: jpg, jpeg, png, gif, webp
                $imageData = base64_encode(file_get_contents($filePath));
                $content[] = [
                    'type' => 'image_url',
                    'image_url' => ['url' => "data:{$mimeType};base64,{$imageData}"],
                ];
            }

            $response = \Illuminate\Support\Facades\Http::timeout(60)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'user', 'content' => $content],
                ],
                'max_tokens' => 500,
            ]);

            if ($response->failed()) {
                $verification->update([
                    'status' => 'failed',
                    'ai_response' => 'OpenAI API error: ' . $response->body(),
                ]);
                return;
            }

            $aiContent = $response->json('choices.0.message.content');
            $verification->update(['ai_response' => $aiContent]);

            // Parse JSON from response
            preg_match('/\{.*\}/s', $aiContent, $matches);
            if (!empty($matches)) {
                $data = json_decode($matches[0], true);
                if ($data && ($data['is_valid'] ?? false)) {
                    $verification->update([
                        'status' => 'verified',
                        'company_name' => $data['company_name'] ?? null,
                        'registration_number' => $data['registration_number'] ?? null,
                        'expiry_date' => $data['expiry_date'] ?? null,
                        'grace_period_ends_at' => null,
                        'services_hidden_at' => null,
                    ]);
                    Service::where('user_id', $verification->user_id)->update(['is_active' => true]);
                    return;
                }
            }

            $verification->update(['status' => 'failed']);
        } catch (\Exception $e) {
            $verification->update([
                'status' => 'failed',
                'ai_response' => 'Error: ' . $e->getMessage(),
            ]);
        }
    }

    private function extractTextFromDocx(string $filePath): ?string
    {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($filePath) !== true) {
                return null;
            }

            $content = $zip->getFromName('word/document.xml');
            $zip->close();

            if (!$content) {
                return null;
            }

            // Strip XML tags to get plain text
            $text = strip_tags(str_replace('<', ' <', $content));
            $text = preg_replace('/\s+/', ' ', $text);
            return trim($text);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function index(Request $request)
    {
        $query = SsmVerification::with('user')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $stats = [
            'total' => SsmVerification::count(),
            'pending' => SsmVerification::where('status', 'pending')->count(),
            'verified' => SsmVerification::where('status', 'verified')->count(),
            'failed' => SsmVerification::where('status', 'failed')->count(),
            'expired' => SsmVerification::where('status', 'expired')->count(),
        ];

        return Inertia::render('Admin/SsmVerifications', [
            'verifications' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats,
        ]);
    }

    public function manualVerify(Request $request, SsmVerification $verification)
    {
        $request->validate([
            'status' => 'required|in:verified,failed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $updateData = [
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ];

        if ($request->status === 'verified') {
            $updateData['grace_period_ends_at'] = null;
            $updateData['services_hidden_at'] = null;
        }

        $verification->update($updateData);

        if ($request->status === 'verified') {
            Service::where('user_id', $verification->user_id)->update(['is_active' => true]);
        }

        return back()->with('success', 'Verification updated.');
    }

    public function destroy(SsmVerification $verification)
    {
        if ($verification->document_path) {
            Storage::disk('public')->delete($verification->document_path);
        }

        $verification->delete();

        return redirect()->route('admin.ssm.index')->with('success', 'SSM verification deleted.');
    }

    public function adminSettings()
    {
        return Inertia::render('Admin/Settings', [
            'openai_api_key' => AdminSetting::get('openai_api_key') ? '••••••••' : '',
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'openai_api_key' => 'nullable|string|max:255',
        ]);

        if ($request->openai_api_key && $request->openai_api_key !== '••••••••') {
            AdminSetting::set('openai_api_key', $request->openai_api_key);
        }

        return back()->with('success', 'Settings updated.');
    }
}
