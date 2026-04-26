<?php

namespace App\Services;

use App\Models\AdminSetting;
use App\Models\Service;
use App\Models\SsmVerification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Runs AI-powered SSM certificate verification.
 *
 * Reads the active provider from admin settings (openai or claude) and
 * dispatches to the matching backend. Updates the SsmVerification model
 * in place — sets status to verified/failed and writes ai_response.
 *
 * Used by both the mobile upload endpoint and the web admin actions, so
 * any change to the AI flow happens in one place.
 */
class SsmAiVerifier
{
    private const PROMPT = 'Extract the following from this SSM (Suruhanjaya Syarikat Malaysia) business certificate: company_name, registration_number, expiry_date (YYYY-MM-DD format). Return JSON only: {"company_name": "...", "registration_number": "...", "expiry_date": "...", "is_valid": true/false}. If not a valid SSM certificate, set is_valid to false.';

    /**
     * Run AI verification for the given SSM record.
     * No-op if the active provider has no API key configured.
     */
    public function verify(SsmVerification $verification): void
    {
        $provider = AdminSetting::get('active_ai_provider', 'openai');
        $apiKey = AdminSetting::get(
            $provider === 'claude' ? 'claude_api_key' : 'openai_api_key'
        );

        if (! $apiKey) {
            return;
        }

        if ($provider === 'claude') {
            $this->verifyWithClaude($verification, $apiKey);
        } else {
            $this->verifyWithOpenAi($verification, $apiKey);
        }
    }

    /**
     * Returns true if the active provider has a key configured.
     * Useful for controllers that want to surface a "no provider" error
     * to the user before attempting verification.
     */
    public function activeProviderConfigured(): bool
    {
        $provider = AdminSetting::get('active_ai_provider', 'openai');
        $key = $provider === 'claude' ? 'claude_api_key' : 'openai_api_key';
        return ! empty(AdminSetting::get($key));
    }

    public function activeProviderName(): string
    {
        return AdminSetting::get('active_ai_provider', 'openai');
    }

    private function verifyWithOpenAi(SsmVerification $verification, string $apiKey): void
    {
        try {
            $filePath = Storage::disk('public')->path($verification->document_path);
            $mimeType = mime_content_type($filePath);
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

            $content = [['type' => 'text', 'text' => self::PROMPT]];

            if (in_array($extension, ['doc', 'docx'])) {
                $extractedText = $this->extractTextFromDocx($filePath);
                if (! $extractedText) {
                    $verification->update(['status' => 'failed', 'ai_response' => 'Could not extract text from document.']);
                    return;
                }
                $content = [['type' => 'text', 'text' => self::PROMPT . "\n\nDocument text content:\n" . $extractedText]];
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

            $response = Http::timeout(60)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [['role' => 'user', 'content' => $content]],
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
            $this->applyAiResult($verification, $aiContent);
        } catch (\Throwable $e) {
            $verification->update([
                'status' => 'failed',
                'ai_response' => 'Error: ' . $e->getMessage(),
            ]);
        }
    }

    private function verifyWithClaude(SsmVerification $verification, string $apiKey): void
    {
        try {
            $filePath = Storage::disk('public')->path($verification->document_path);
            $mimeType = mime_content_type($filePath);
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

            $content = [];

            if (in_array($extension, ['doc', 'docx'])) {
                $extractedText = $this->extractTextFromDocx($filePath);
                if (! $extractedText) {
                    $verification->update(['status' => 'failed', 'ai_response' => 'Could not extract text from document.']);
                    return;
                }
                $content[] = ['type' => 'text', 'text' => self::PROMPT . "\n\nDocument text content:\n" . $extractedText];
            } elseif ($extension === 'pdf') {
                $content[] = [
                    'type' => 'document',
                    'source' => [
                        'type' => 'base64',
                        'media_type' => 'application/pdf',
                        'data' => base64_encode(file_get_contents($filePath)),
                    ],
                ];
                $content[] = ['type' => 'text', 'text' => self::PROMPT];
            } else {
                $content[] = [
                    'type' => 'image',
                    'source' => [
                        'type' => 'base64',
                        'media_type' => $mimeType,
                        'data' => base64_encode(file_get_contents($filePath)),
                    ],
                ];
                $content[] = ['type' => 'text', 'text' => self::PROMPT];
            }

            $response = Http::timeout(60)->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-haiku-4-5',
                'max_tokens' => 500,
                'messages' => [['role' => 'user', 'content' => $content]],
            ]);

            if ($response->failed()) {
                $verification->update([
                    'status' => 'failed',
                    'ai_response' => 'Anthropic API error: ' . $response->body(),
                ]);
                return;
            }

            $aiContent = $response->json('content.0.text');
            $this->applyAiResult($verification, (string) $aiContent);
        } catch (\Throwable $e) {
            $verification->update([
                'status' => 'failed',
                'ai_response' => 'Error: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Parse the AI response, store it raw, and update the verification +
     * downstream user/services if the certificate is valid.
     */
    private function applyAiResult(SsmVerification $verification, ?string $aiContent): void
    {
        $verification->update(['ai_response' => $aiContent]);

        if (! $aiContent) {
            $verification->update(['status' => 'failed']);
            return;
        }

        preg_match('/\{.*\}/s', $aiContent, $matches);
        if (empty($matches)) {
            $verification->update(['status' => 'failed']);
            return;
        }

        $data = json_decode($matches[0], true);
        if (! $data || ! ($data['is_valid'] ?? false)) {
            $verification->update(['status' => 'failed']);
            return;
        }

        $verification->update([
            'status' => 'verified',
            'company_name' => $data['company_name'] ?? null,
            'registration_number' => $data['registration_number'] ?? null,
            'expiry_date' => $data['expiry_date'] ?? null,
            'grace_period_ends_at' => null,
            'services_hidden_at' => null,
        ]);

        Service::where('user_id', $verification->user_id)->update(['is_active' => true]);

        // Sync extracted company name back to the user record so it shows
        // in profile / freelancer listings without manual entry.
        if (! empty($data['company_name'])) {
            User::where('id', $verification->user_id)
                ->update(['company_name' => $data['company_name']]);
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
            if (! $content) {
                return null;
            }
            $text = strip_tags(str_replace('<', ' <', $content));
            $text = preg_replace('/\s+/', ' ', $text);
            return trim($text);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
