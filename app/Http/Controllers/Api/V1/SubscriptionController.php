<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\SubscriptionPlanResource;
use App\Models\AdminSetting;
use App\Models\PaymentGateway;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Transaction;
use App\Services\BayarcashService;
use App\Services\SenangpayService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    use ApiResponse;

    protected $bayarcash;
    protected $senangpay;

    public function __construct(BayarcashService $bayarcash, SenangpayService $senangpay)
    {
        $this->bayarcash = $bayarcash;
        $this->senangpay = $senangpay;
    }

    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();

        $gateways = PaymentGateway::where('is_active', true)->get()->map(fn ($gw) => [
            'slug' => $gw->slug,
            'name' => $gw->name,
        ]);

        return $this->success([
            'plans' => SubscriptionPlanResource::collection($plans),
            'gateways' => $gateways,
        ]);
    }

    public function initiatePayment(Request $request, SubscriptionPlan $plan): JsonResponse
    {
        $user = $request->user();

        if ($user->hasActiveSubscription()) {
            return $this->error('You already have an active subscription.', 422);
        }

        if (!$plan->is_active) {
            return $this->error('This plan is no longer available.', 422);
        }

        // Plans that require approval (e.g. Madani) skip the gateway —
        // route the customer to the application form instead.
        if ($plan->requires_approval) {
            return $this->success([
                'requires_approval' => true,
                'plan_slug' => $plan->slug,
            ], 'This plan requires an application before activation.');
        }

        $request->validate([
            'gateway' => 'required|string|in:bayarcash,senangpay',
        ]);

        $gateway = $request->input('gateway');

        $orderNumber = 'PLAN-' . $user->id . '-' . $plan->id . '-' . time();

        // Founding-member discount: early adopters get RM 99 first year on
        // Starter Hub, instead of the full RM 199. One-shot per user.
        $amount = (float) $plan->price;
        if ($plan->slug === 'starter-hub' && $user->isFoundingMemberEligible()) {
            $amount = (float) (AdminSetting::get('founding_member_starter_price') ?? 99);
        }

        Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'order_number' => $orderNumber,
            'amount' => $amount,
            'currency' => 'MYR',
            'gateway' => $gateway,
            'status' => 'pending',
        ]);

        if ($gateway === 'bayarcash') {
            return $this->payWithBayarcash($user, $plan, $orderNumber, $amount);
        }

        return $this->payWithSenangpay($user, $plan, $orderNumber, $amount);
    }

    protected function payWithBayarcash($user, SubscriptionPlan $plan, string $orderNumber, ?float $amount = null): JsonResponse
    {
        $amount = $amount ?? (float) $plan->price;
        $result = $this->bayarcash->createPaymentIntent([
            'order_number' => $orderNumber,
            'amount' => $amount,
            'payer_name' => $user->name,
            'payer_email' => $user->email ?? $user->phone_number . '@noemail.oneclickhub.com',
            'payer_telephone_number' => $user->phone_number,
            'return_url' => route('payment.bayarcash.return'),
            'callback_url' => route('payment.bayarcash.callback'),
        ]);

        if ($result['success'] && !empty($result['payment_url'])) {
            return $this->success([
                'payment_url' => $result['payment_url'],
                'order_number' => $orderNumber,
            ], 'Payment initiated');
        }

        Log::error('Bayarcash payment initiation failed (mobile)', $result);

        $errorMessage = 'Unable to connect to payment gateway. Please try again.';
        if (!empty($result['details']['message'])) {
            $errorMessage .= ' Error: ' . $result['details']['message'];
        } elseif (!empty($result['error'])) {
            $errorMessage .= ' (' . $result['error'] . ')';
        }

        return $this->error($errorMessage, 502);
    }

    protected function payWithSenangpay($user, SubscriptionPlan $plan, string $orderNumber, ?float $amount = null): JsonResponse
    {
        $amount = $amount ?? (float) $plan->price;
        $result = $this->senangpay->createPayment([
            'detail' => 'Subscription: ' . $plan->name,
            'amount' => $amount,
            'order_id' => $orderNumber,
            'name' => $user->name,
            'email' => $user->email ?? '',
            'phone' => $user->phone_number,
        ]);

        if ($result['success'] && !empty($result['payment_url'])) {
            return $this->success([
                'payment_url' => $result['payment_url'],
                'order_number' => $orderNumber,
            ], 'Payment initiated');
        }

        Log::error('SenangPay payment initiation failed', $result);

        return $this->error('Unable to connect to payment gateway. Please try again.', 502);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (!$subscription || $subscription->status !== Subscription::STATUS_ACTIVE) {
            return $this->error('No active subscription to cancel.', 422);
        }

        $subscription->update(['status' => Subscription::STATUS_CANCELLED]);

        $remainingDays = $subscription->remaining_days;

        return $this->success([
            'remaining_days' => $remainingDays,
            'ends_at' => $subscription->ends_at?->toISOString(),
        ], "Subscription cancelled. You can still use your plan for {$remainingDays} more days.");
    }
}
