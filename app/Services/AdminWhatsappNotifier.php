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
 *    in which case `dispatch()->delay()` would silently sit in the jobs
 *    table forever. Instead we fire the HTTP send synchronously, but
 *    inside `app()->terminating()` so the request response is already
 *    flushed to the user — they don't wait on Sendora.
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

        // Reserve the slot now so two concurrent requests don't both fire.
        // Use a SHORT reservation initially — if the actual send succeeds we
        // extend it to the full throttle window. This prevents a single
        // failed send from silently blocking notifications for 30 minutes.
        Cache::put(self::SLOT_KEY, $now->toIso8601String(), now()->addSeconds(60));

        // Defer the HTTP call until the user response has flushed so the
        // form submission stays snappy. If the framework can't terminate
        // (e.g. running from CLI), fall back to immediate send.
        $throttleMinutes = $this->throttleMinutes();
        $task = function () use ($phone, $body, $now, $throttleMinutes) {
            try {
                $ok = app(SendoraService::class)->sendMessage($phone, $body);
                if ($ok) {
                    // Confirmed delivery — hold the slot for the full window.
                    Cache::put(self::SLOT_KEY, $now->toIso8601String(), now()->addMinutes($throttleMinutes + 5));
                } else {
                    // Send failed — release the slot so the next event can retry.
                    Cache::forget(self::SLOT_KEY);
                    Log::warning('Sendora admin notify dispatched but Sendora returned non-success.');
                }
            } catch (\Throwable $e) {
                Cache::forget(self::SLOT_KEY);
                Log::error('Sendora admin notify exception', ['error' => $e->getMessage()]);
            }
        };

        if (app()->bound('Illuminate\Foundation\Application') && method_exists(app(), 'terminating')) {
            app()->terminating($task);
        } else {
            $task();
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
