<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BankingDetailResource;
use App\Http\Resources\V1\SsmVerificationResource;
use App\Http\Resources\V1\UserResource;
use App\Models\AdminSetting;
use App\Models\Service;
use App\Models\SsmVerification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    use ApiResponse;

    public function profile(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load('roles')));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'position' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $user->profile_picture = $request->file('profile_picture')->store('profile-pictures', 'public');
        }

        unset($validated['profile_picture']);
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $this->success(new UserResource($user->load('roles')), 'Profile updated successfully.');
    }

    public function bankingDetail(Request $request): JsonResponse
    {
        $banking = $request->user()->bankingDetail;

        return $this->success(
            $banking ? new BankingDetailResource($banking) : null
        );
    }

    public function updateBanking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:255',
        ]);

        $request->user()->bankingDetail()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return $this->success(null, 'Banking details updated successfully.');
    }

    public function ssmCertificate(Request $request): JsonResponse
    {
        $ssm = $request->user()->ssmVerification;

        $data = null;
        if ($ssm) {
            $data = new SsmVerificationResource($ssm);
        }

        return $this->success($data);
    }

    public function uploadSsm(Request $request): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('document')->store('ssm-documents', 'public');

        $verification = SsmVerification::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'document_path' => $path,
                'status' => 'pending',
                'company_name' => null,
                'registration_number' => null,
                'expiry_date' => null,
                'ai_response' => null,
            ]
        );

        // Try AI verification if configured
        $apiKey = AdminSetting::get('openai_api_key');
        if ($apiKey) {
            $this->verifyWithAi($verification, $apiKey);
        }

        return $this->success(
            new SsmVerificationResource($verification->fresh()),
            'SSM document uploaded. Verification is being processed.'
        );
    }

    private function verifyWithAi(SsmVerification $verification, string $apiKey): void
    {
        try {
            $filePath = Storage::disk('public')->path($verification->document_path);
            $mimeType = mime_content_type($filePath);
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

            $prompt = 'Extract the following from this SSM (Suruhanjaya Syarikat Malaysia) business certificate: company_name, registration_number, expiry_date (YYYY-MM-DD format). Return JSON only: {"company_name": "...", "registration_number": "...", "expiry_date": "...", "is_valid": true/false}. If not a valid SSM certificate, set is_valid to false.';

            $content = [['type' => 'text', 'text' => $prompt]];

            if (in_array($extension, ['doc', 'docx'])) {
                $extractedText = $this->extractTextFromDocx($filePath);
                if ($extractedText) {
                    $content = [['type' => 'text', 'text' => $prompt . "\n\nDocument text content:\n" . $extractedText]];
                } else {
                    $verification->update(['status' => 'failed', 'ai_response' => 'Could not extract text from document.']);
                    return;
                }
            } elseif ($extension === 'pdf') {
                $fileData = base64_encode(file_get_contents($filePath));
                $content[] = [
                    'type' => 'file',
                    'file' => [
                        'filename' => basename($filePath),
                        'file_data' => "data:application/pdf;base64,{$fileData}",
                    ],
                ];
            } else {
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
                'messages' => [['role' => 'user', 'content' => $content]],
                'max_tokens' => 500,
            ]);

            if ($response->failed()) {
                $verification->update(['status' => 'failed', 'ai_response' => 'OpenAI API error: ' . $response->body()]);
                return;
            }

            $aiContent = $response->json('choices.0.message.content');
            $verification->update(['ai_response' => $aiContent]);

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
            $verification->update(['status' => 'failed', 'ai_response' => 'Error: ' . $e->getMessage()]);
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
            $text = strip_tags(str_replace('<', ' <', $content));
            $text = preg_replace('/\s+/', ' ', $text);
            return trim($text);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function markNotificationsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return $this->success(null, 'Notifications marked as read.');
    }
}
