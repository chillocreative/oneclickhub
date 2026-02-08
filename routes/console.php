<?php

use App\Models\Order;
use App\Models\Service;
use App\Models\SsmVerification;
use App\Models\User;
use App\Notifications\SsmGracePeriodReminder;
use App\Notifications\SsmServicesHidden;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-cancel orders pending_approval > 24h
Schedule::call(function () {
    $orders = Order::where('status', Order::STATUS_PENDING_APPROVAL)
        ->where('payment_slip_uploaded_at', '<', now()->subHours(24))
        ->get();

    foreach ($orders as $order) {
        $order->update([
            'status' => Order::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => 'Auto-cancelled: Freelancer did not respond within 24 hours.',
        ]);

        // Notify admins
        $admins = User::role('Admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\OrderAutoCancel($order));
        }
    }
})->hourly()->name('auto-cancel-orders');

// Auto-complete orders delivered > 72h (customer didn't respond)
Schedule::call(function () {
    $orders = Order::where('status', Order::STATUS_DELIVERED)
        ->where('delivered_at', '<', now()->subHours(72))
        ->get();

    foreach ($orders as $order) {
        $order->update([
            'status' => Order::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }
})->hourly()->name('auto-complete-orders');

// SSM: Start 60-day renewal grace when verified SSM expires
Schedule::call(function () {
    $expired = SsmVerification::where('status', SsmVerification::STATUS_VERIFIED)
        ->whereNotNull('expiry_date')
        ->where('expiry_date', '<=', today())
        ->whereNull('grace_period_ends_at')
        ->get();

    foreach ($expired as $ssm) {
        $ssm->update([
            'status' => SsmVerification::STATUS_EXPIRED,
            'grace_period_ends_at' => now()->addDays(60),
        ]);

        $ssm->user?->notify(new SsmGracePeriodReminder(60));
    }
})->daily()->name('ssm-expiry-grace');

// SSM: Auto-hide services when grace period expires
Schedule::call(function () {
    $expiredGrace = SsmVerification::where('grace_period_ends_at', '<', now())
        ->where('status', '!=', SsmVerification::STATUS_VERIFIED)
        ->whereNull('services_hidden_at')
        ->with('user')
        ->get();

    $admins = User::role('Admin')->get();

    foreach ($expiredGrace as $ssm) {
        if ($ssm->user) {
            Service::where('user_id', $ssm->user_id)->update(['is_active' => false]);

            $ssm->update(['services_hidden_at' => now()]);

            $ssm->user->notify(new SsmServicesHidden());

            foreach ($admins as $admin) {
                $admin->notify(new SsmServicesHidden($ssm->user->name));
            }
        }
    }
})->daily()->name('ssm-hide-services');

// SSM: Grace period reminder notifications (14, 7, 3, 1 days before expiry)
Schedule::call(function () {
    foreach ([14, 7, 3, 1] as $days) {
        $target = now()->addDays($days)->startOfDay();

        $verifications = SsmVerification::where('status', '!=', SsmVerification::STATUS_VERIFIED)
            ->whereNotNull('grace_period_ends_at')
            ->whereNull('services_hidden_at')
            ->whereDate('grace_period_ends_at', $target)
            ->with('user')
            ->get();

        foreach ($verifications as $ssm) {
            $ssm->user?->notify(new SsmGracePeriodReminder($days));
        }
    }
})->daily()->name('ssm-grace-reminders');
