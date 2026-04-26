<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendoraService
{
    /**
     * Send a single WhatsApp message via the Sendora blaster.
     *
     * @return bool true on 2xx; false on any failure (logged but never throws).
     */
    public function sendMessage(string $phone, string $body): bool
    {
        $base = rtrim(config('sendora.base_url'), '/');
        $token = config('sendora.api_token');
        $device = config('sendora.device_id');

        if ($base === '' || $token === '' || $device === '') {
            Log::warning('Sendora not configured — skipping message', [
                'phone' => $phone,
            ]);
            return false;
        }

        $to = $this->normalisePhone($phone);
        if ($to === null) {
            Log::warning('Sendora: invalid phone, skipping', ['phone' => $phone]);
            return false;
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout(15)
                ->post("$base/api/v1/send-message", [
                    'device_id' => $device,
                    'to' => $to,
                    'message' => $body,
                ]);

            if ($response->successful()) {
                return true;
            }

            Log::warning('Sendora send failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'to' => $to,
            ]);
        } catch (\Throwable $e) {
            Log::error('Sendora send exception', ['error' => $e->getMessage()]);
        }

        return false;
    }

    /**
     * Strip non-digits and normalise Malaysian numbers to country-code form.
     * Mirrors the Sendora blaster's own normaliser so both ends agree.
     */
    public function normalisePhone(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $digits = preg_replace('/\D+/', '', $raw);
        if ($digits === '') {
            return null;
        }
        $prefix = (string) config('sendora.country_prefix', '6');
        if (str_starts_with($digits, '0')) {
            $digits = $prefix . substr($digits, 1);
        } elseif (!str_starts_with($digits, $prefix)) {
            // Already-international or unknown country left as-is.
        }
        return $digits;
    }
}
