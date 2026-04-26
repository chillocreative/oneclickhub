<?php

namespace App\Services;

use App\Jobs\SendAdminWhatsappAlert;
use App\Models\AdminSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Coordinates admin WhatsApp alerts so we never deliver them
 * faster than `sendora.admin_throttle_minutes` apart, regardless
 * of how often the underlying event fires.
 *
 * Implementation: pick the next free time slot (max(now, last_slot + N))
 * and `dispatch()->delay($slot)`. Keeps the schedule in cache so it
 * survives across requests; survives queue restarts because each
 * scheduled job carries its own delay.
 */
class AdminWhatsappNotifier
{
    private const SLOT_KEY = 'sendora.admin.last_slot_at';

    public function notify(string $body): void
    {
        $stored = AdminSetting::get('sendora_admin_throttle_minutes');
        $throttleMinutes = (int) ($stored !== null && $stored !== ''
            ? $stored
            : config('sendora.admin_throttle_minutes', 30));
        $now = now();

        $stored = Cache::get(self::SLOT_KEY);
        $lastSlot = $stored ? Carbon::parse($stored) : $now->copy()->subMinutes($throttleMinutes + 1);
        $earliest = $lastSlot->copy()->addMinutes($throttleMinutes);
        $slot = $now->greaterThan($earliest) ? $now : $earliest;

        // Persist for ~ a day, plenty for a 30-minute throttle.
        Cache::put(self::SLOT_KEY, $slot->toIso8601String(), now()->addDay());

        $delay = $slot->isFuture() ? $now->diffInSeconds($slot) : 0;

        SendAdminWhatsappAlert::dispatch($body)->delay($delay);
    }
}
