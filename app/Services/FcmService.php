<?php

namespace App\Services;

use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    private string $projectId;
    private ?array $credentials = null;

    public function __construct()
    {
        $credentialsPath = storage_path('app/firebase-credentials.json');
        if (file_exists($credentialsPath)) {
            $this->credentials = json_decode(file_get_contents($credentialsPath), true);
            $this->projectId = $this->credentials['project_id'] ?? '';
        } else {
            Log::warning('FCM: firebase-credentials.json not found at ' . $credentialsPath);
            $this->projectId = '';
        }
    }

    public function sendToRole(string $targetRole, string $title, string $body): int
    {
        $query = FcmToken::query();

        if ($targetRole !== 'all') {
            $userIds = User::role($targetRole)->pluck('id');
            $query->whereIn('user_id', $userIds);
        }
        // When 'all', no filter is applied — includes guest tokens (user_id IS NULL)

        $tokens = $query->pluck('token')->toArray();
        Log::info('FCM: Sending to role=' . $targetRole . ', tokens found=' . count($tokens));

        if (empty($tokens)) {
            return 0;
        }

        return $this->sendToTokens($tokens, $title, $body);
    }

    /**
     * Send a notification to all FCM tokens belonging to a single user.
     * Returns the number of devices the message was successfully delivered to.
     */
    public function sendToUser(int $userId, string $title, string $body, array $data = []): int
    {
        $tokens = FcmToken::where('user_id', $userId)->pluck('token')->toArray();
        if (empty($tokens)) {
            return 0;
        }
        return $this->sendToTokens($tokens, $title, $body, $data);
    }

    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): int
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            Log::error('FCM: Failed to get access token');
            return 0;
        }

        $successCount = 0;
        $invalidTokens = [];

        foreach ($tokens as $token) {
            $payload = [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'sound' => 'default',
                            'channel_id' => 'high_importance_channel',
                        ],
                    ],
                ],
            ];

            if (!empty($data)) {
                $payload['message']['data'] = array_map('strval', $data);
            }

            try {
                $response = Http::withToken($accessToken)
                    ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", $payload);

                if ($response->successful()) {
                    $successCount++;
                } else {
                    $error = $response->json();
                    $errorCode = $error['error']['details'][0]['errorCode'] ?? $error['error']['status'] ?? '';
                    if (in_array($errorCode, ['UNREGISTERED', 'INVALID_ARGUMENT', 'NOT_FOUND'])) {
                        $invalidTokens[] = $token;
                    }
                    Log::warning('FCM send failed', ['token' => substr($token, 0, 20) . '...', 'error' => $error]);
                }
            } catch (\Exception $e) {
                Log::error('FCM send exception', ['error' => $e->getMessage()]);
            }
        }

        // Clean up invalid tokens
        if (!empty($invalidTokens)) {
            FcmToken::whereIn('token', $invalidTokens)->delete();
        }

        return $successCount;
    }

    private function getAccessToken(): ?string
    {
        if (!$this->credentials) {
            return null;
        }

        try {
            $now = time();
            $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claim = $this->base64UrlEncode(json_encode([
                'iss' => $this->credentials['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => $this->credentials['token_uri'],
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

            $signatureInput = "$header.$claim";
            $privateKey = openssl_pkey_get_private($this->credentials['private_key']);
            if (!$privateKey) {
                Log::error('FCM: Failed to parse private key');
                return null;
            }
            openssl_sign($signatureInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);
            $jwt = "$signatureInput." . $this->base64UrlEncode($signature);

            $response = Http::asForm()->post($this->credentials['token_uri'], [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if ($response->successful()) {
                return $response->json('access_token');
            }

            Log::error('FCM: Token exchange failed', ['response' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('FCM: Access token error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
