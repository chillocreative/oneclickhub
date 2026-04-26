<?php

namespace App\Services;

use App\Models\AdminSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Coordinates admin WhatsApp alerts so we never deliver them faster
 * than `sendora.admin_throttle_minutes` apart, regardless of how often
 * the underlying event fires.
 *
 * Implementation notes:
 *  - We do NOT use a queue here. Production may not run a queue worker,
 *    so `dispatch()` would silently sit in the jobs table forever.
 *  - We also do NOT defer via `app()->terminating()`. On Apache mod_php
 *    and several FCGI configurations the terminating callbacks don't
 *    reliably fire after the response flushes, which silently dropped
 *    contact-form pings. We now call Sendora synchronously inside the
 *    request — same pattern the admin "Test ping" button uses, which
 *    is why that one always works. Sendora typically responds in 1–2s.
 *  - Throttling is implemented as a "skip" (silently drop) rather than
 *    a "delay" (queue for later). For low-frequency events like new
 *    subscriptions / contact-form submissions, skipping is fine — the
 *    underlying record is already in the database, the admin can scan
 *    the dashboard at any time.
 */
class AdminWhatsappNotifier
{
    private const SLOT_KEY = 'sendora.admin.last_sent_at';

    public function notify(string $body): void
    {
        $throttleMinutes = $this->throttleMinutes();
        $now = now();

        $lastSentRaw = Cache::get(self::SLOT_KEY);
        if ($lastSentRaw) {
            $lastSent = Carbon::parse($lastSentRaw);
            $nextEligible = $lastSent->copy()->addMinutes($throttleMinutes);
            if ($nextEligible->isFuture()) {
                Log::info('Sendora admin notify throttled — skipping', [
                    'last_sent_at' => $lastSent->toIso8601String(),
                    'next_eligible' => $nextEligible->toIso8601String(),
                ]);
                return;
            }
        }

        $phone = AdminSetting::get('sendora_admin_phone') ?: config('sendora.admin_phone');
        if (!$phone) {
            Log::warning('Sendora admin notify skipped: admin phone not configured. Set it in Admin → Settings or SENDORA_ADMIN_PHONE in .env.');
            return;
        }

        // Reserve the slot briefly so two concurrent requests don't both fire.
        // We extend it to the full throttle window only after a confirmed send.
        Cache::put(self::SLOT_KEY, $now->toIso8601String(), now()->addSeconds(60));

        try {
            $ok = app(SendoraService::class)->sendMessage($phone, $body);
            if ($ok) {
                Cache::put(self::SLOT_KEY, $now->toIso8601String(), now()->addMinutes($throttleMinutes + 5));
            } else {
                Cache::forget(self::SLOT_KEY);
                Log::warning('Sendora admin notify dispatched but Sendora returned non-success.');
            }
        } catch (\Throwable $e) {
            Cache::forget(self::SLOT_KEY);
            Log::error('Sendora admin notify exception', ['error' => $e->getMessage()]);
        }
    }

    private function throttleMinutes(): int
    {
        $stored = AdminSetting::get('sendora_admin_throttle_minutes');
        return (int) ($stored !== null && $stored !== ''
            ? $stored
            : config('sendora.admin_throttle_minutes', 30));
    }
}
