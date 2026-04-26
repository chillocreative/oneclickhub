<?php

namespace App\Listeners;

use App\Models\AdminSetting;
use App\Models\SubscriptionPlan;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;

/**
 * Grants every brand-new user a 90-day Starter Hub subscription whenever
 * the `early_adopter_enabled` admin setting is on. Admin can flip the
 * setting off in the dashboard the moment the campaign is over.
 */
class GrantEarlyAdopterSubscription
{
    public function handle(Registered $event): void
    {
        $enabled = AdminSetting::get('early_adopter_enabled', '1');
        if ((string) $enabled !== '1') {
            return;
        }

        $user = $event->user;
        if (!$user) {
            return;
        }

        if (method_exists($user, 'hasActiveSubscription') && $user->hasActiveSubscription()) {
            return;
        }

        $plan = SubscriptionPlan::where('slug', 'starter-hub')
            ->where('is_active', true)
            ->first();
        if (!$plan) {
            Log::info('Early adopter grant skipped: starter-hub plan missing.');
            return;
        }

        try {
            $user->subscribeToPlan($plan, [], 90, 'early_adopter');
        } catch (\Throwable $e) {
            Log::warning('Early adopter grant failed', ['error' => $e->getMessage()]);
        }
    }
}
