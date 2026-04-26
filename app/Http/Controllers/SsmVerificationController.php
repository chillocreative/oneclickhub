<?php

namespace App\Http\Controllers;

use App\Models\AdminSetting;
use App\Models\Service;
use App\Models\SsmVerification;
use App\Services\SendoraService;
use App\Services\SsmAiVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SsmVerificationController extends Controller
{
    public function __construct(private SsmAiVerifier $verifier)
    {
    }

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

        $this->verifier->verify($verification);

        return back()->with('success', 'SSM document uploaded. Verification is being processed.');
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

    public function aiVerify(SsmVerification $verification)
    {
        if (! $this->verifier->activeProviderConfigured()) {
            $provider = $this->verifier->activeProviderName();
            return back()->withErrors([
                'ai' => 'No API key configured for the active AI provider (' . $provider . '). Add one in Admin → Settings.',
            ]);
        }

        // Reset to pending so the row reflects the re-analysis attempt regardless of outcome.
        $verification->update([
            'status' => 'pending',
            'ai_response' => null,
        ]);

        $this->verifier->verify($verification);

        $verification->refresh();

        $provider = $this->verifier->activeProviderName();

        return match ($verification->status) {
            'verified' => back()->with('success', 'Verified by AI (' . $provider . ').'),
            'failed' => back()->with('error', 'AI could not validate this certificate. See raw response in the certificate modal.'),
            default => back()->with('warning', 'AI analysis finished without a verdict. Status left as ' . $verification->status . '.'),
        };
    }

    public function adminSettings()
    {
        return Inertia::render('Admin/Settings', [
            'openai_api_key' => AdminSetting::get('openai_api_key') ? '••••••••' : '',
            'claude_api_key' => AdminSetting::get('claude_api_key') ? '••••••••' : '',
            'active_ai_provider' => AdminSetting::get('active_ai_provider', 'openai'),
            'early_adopter_enabled' => (string) AdminSetting::get('early_adopter_enabled', '1') === '1',
            // Sendora WhatsApp — AdminSetting wins, .env as fallback so the
            // page is pre-filled with whatever the server is currently using.
            'sendora_base_url' => AdminSetting::get('sendora_base_url', config('sendora.base_url', '')),
            'sendora_api_token' => AdminSetting::get('sendora_api_token') ? '••••••••' : '',
            'sendora_device_id' => AdminSetting::get('sendora_device_id', config('sendora.device_id', '')),
            'sendora_admin_phone' => AdminSetting::get('sendora_admin_phone', config('sendora.admin_phone', '')),
            'sendora_admin_throttle_minutes' => AdminSetting::get('sendora_admin_throttle_minutes', (string) config('sendora.admin_throttle_minutes', 30)),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'openai_api_key' => 'nullable|string|max:255',
            'claude_api_key' => 'nullable|string|max:255',
            'active_ai_provider' => 'required|in:openai,claude',
            'early_adopter_enabled' => 'nullable|boolean',
            'sendora_base_url' => 'nullable|url|max:255',
            'sendora_api_token' => 'nullable|string|max:512',
            'sendora_device_id' => 'nullable|string|max:128',
            'sendora_admin_phone' => 'nullable|string|max:20',
            'sendora_admin_throttle_minutes' => 'nullable|integer|min:1|max:1440',
        ]);

        if ($request->openai_api_key && $request->openai_api_key !== '••••••••') {
            AdminSetting::set('openai_api_key', $request->openai_api_key);
        }

        if ($request->claude_api_key && $request->claude_api_key !== '••••••••') {
            AdminSetting::set('claude_api_key', $request->claude_api_key);
        }

        AdminSetting::set('active_ai_provider', $request->active_ai_provider);

        if ($request->has('early_adopter_enabled')) {
            AdminSetting::set(
                'early_adopter_enabled',
                $request->boolean('early_adopter_enabled') ? '1' : '0',
            );
        }

        // Sendora — plain fields (overwrite even if blank so admin can clear)
        foreach (['sendora_base_url', 'sendora_device_id', 'sendora_admin_phone', 'sendora_admin_throttle_minutes'] as $key) {
            if ($request->has($key)) {
                AdminSetting::set($key, (string) $request->input($key, ''));
            }
        }

        // Token: leave alone when the masked placeholder comes back so the
        // admin can save other fields without re-entering it.
        if ($request->filled('sendora_api_token') && $request->sendora_api_token !== '••••••••') {
            AdminSetting::set('sendora_api_token', $request->sendora_api_token);
        }

        return back()->with('success', 'Settings updated.');
    }

    /**
     * Send a test WhatsApp to the configured admin phone so the operator can
     * confirm the device + token + base URL all line up after editing.
     */
    public function sendoraTest(Request $request, SendoraService $sendora)
    {
        $phone = AdminSetting::get('sendora_admin_phone') ?: config('sendora.admin_phone');
        if (!$phone) {
            return back()->with('error', 'Set the admin phone number first, then save.');
        }

        $body = 'One Click Hub test ping ✅ — sent at ' . now()->format('H:i');
        $ok = $sendora->sendMessage($phone, $body);

        if ($ok) {
            return back()->with('success', "Test WhatsApp dispatched to {$phone}.");
        }
        return back()->with('error', 'Sendora send failed. Check the server logs and confirm the device is connected.');
    }
}
