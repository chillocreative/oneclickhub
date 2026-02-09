<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use App\Models\SubscriptionPlan;
use App\Models\Transaction;
use App\Services\BayarcashService;
use App\Services\SenangpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $bayarcash;
    protected $senangpay;

    public function __construct(BayarcashService $bayarcash, SenangpayService $senangpay)
    {
        $this->bayarcash = $bayarcash;
        $this->senangpay = $senangpay;
    }

    /**
     * Show available subscription plans for selection
     */
    public function selectPlan()
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();

        return Inertia::render('Subscribe/Plans', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show checkout page for a specific plan
     */
    public function checkout(SubscriptionPlan $plan)
    {
        if (!$plan->is_active) {
            return redirect()->route('subscribe.plans')
                ->with('error', 'This plan is no longer available.');
        }

        $user = Auth::user();
        if ($user->hasActiveSubscription()) {
            return redirect()->route('dashboard')
                ->with('success', 'You already have an active subscription.');
        }

        $gateways = PaymentGateway::where('is_active', true)->get()->map(function ($gw) {
            return [
                'slug' => $gw->slug,
                'name' => $gw->name,
            ];
        });

        return Inertia::render('Subscribe/Checkout', [
            'plan' => $plan,
            'gateways' => $gateways,
        ]);
    }

    /**
     * Initiate payment for a subscription plan
     */
    public function initiatePayment(Request $request, SubscriptionPlan $plan)
    {
        $request->validate([
            'gateway' => 'required|string|in:bayarcash,senangpay',
        ]);

        $user = Auth::user();
        $gateway = $request->input('gateway');

        if ($user->hasActiveSubscription()) {
            return redirect()->route('dashboard')
                ->with('error', 'You already have an active subscription.');
        }

        if (!$plan->is_active) {
            return redirect()->route('subscribe.plans')
                ->with('error', 'This plan is no longer available.');
        }

        $orderNumber = 'PLAN-' . $user->id . '-' . $plan->id . '-' . time();

        Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'order_number' => $orderNumber,
            'amount' => $plan->price,
            'currency' => 'MYR',
            'gateway' => $gateway,
            'status' => 'pending',
        ]);

        if ($gateway === 'bayarcash') {
            return $this->payWithBayarcash($user, $plan, $orderNumber);
        }

        return $this->payWithSenangpay($user, $plan, $orderNumber);
    }

    /**
     * Create Bayarcash payment intent and redirect
     */
    protected function payWithBayarcash($user, SubscriptionPlan $plan, string $orderNumber)
    {
        $result = $this->bayarcash->createPaymentIntent([
            'order_number' => $orderNumber,
            'amount' => $plan->price,
            'payer_name' => $user->name,
            'payer_email' => $user->email ?? $user->phone_number . '@noemail.oneclickhub.com',
            'payer_telephone_number' => $user->phone_number,
            'return_url' => route('payment.bayarcash.return'),
            'callback_url' => route('payment.bayarcash.callback'),
        ]);

        if ($result['success'] && !empty($result['payment_url'])) {
            return Inertia::location($result['payment_url']);
        }

        Log::error('Bayarcash payment initiation failed', $result);

        return redirect()->route('subscribe.checkout', $plan->slug)
            ->with('error', 'Unable to connect to payment gateway. Please try again.');
    }

    /**
     * Create SenangPay payment and redirect
     */
    protected function payWithSenangpay($user, SubscriptionPlan $plan, string $orderNumber)
    {
        $result = $this->senangpay->createPayment([
            'detail' => 'Subscription: ' . $plan->name,
            'amount' => $plan->price,
            'order_id' => $orderNumber,
            'name' => $user->name,
            'email' => $user->email ?? '',
            'phone' => $user->phone_number,
        ]);

        if ($result['success'] && !empty($result['payment_url'])) {
            return Inertia::location($result['payment_url']);
        }

        Log::error('SenangPay payment initiation failed', $result);

        return redirect()->route('subscribe.checkout', $plan->slug)
            ->with('error', 'Unable to connect to payment gateway. Please try again.');
    }

    /**
     * Handle Bayarcash callback (server-to-server POST)
     * This is the callback_url that receives transaction updates
     */
    public function bayarcashCallback(Request $request)
    {
        Log::info('Bayarcash Callback Received', $request->all());

        $callbackData = $request->all();

        // Validate checksum
        if (!$this->bayarcash->validateCallbackChecksum($callbackData)) {
            Log::warning('Bayarcash callback: Invalid checksum', $callbackData);
            return response()->json(['error' => 'Invalid checksum'], 400);
        }

        $orderNumber = $callbackData['order_number'] ?? null;
        $transactionId = $callbackData['transaction_id'] ?? null;
        $status = $callbackData['status'] ?? null;

        if (!$orderNumber || !$transactionId) {
            Log::error('Bayarcash callback: Missing required fields', $callbackData);
            return response()->json(['error' => 'Missing required fields'], 400);
        }

        // Process based on status
        $transactionStatus = 'pending';
        if ($this->bayarcash->isSuccessful($status)) {
            $transactionStatus = 'success';
        } elseif ($this->bayarcash->isFailed($status)) {
            $transactionStatus = 'failed';
        }

        // Parse order number to find user and plan
        // Format: PLAN-{user_id}-{plan_id}-{timestamp}
        $parts = explode('-', $orderNumber);
        $userId = $parts[1] ?? null;
        $planId = $parts[2] ?? null;

        if ($userId) {
            \App\Models\Transaction::updateOrCreate(
                ['order_number' => $orderNumber],
                [
                    'user_id' => $userId,
                    'subscription_plan_id' => $planId,
                    'transaction_id' => $transactionId,
                    'amount' => $callbackData['amount'] ?? 0, // Bayarcash v3 returns amount in MYR
                    'currency' => 'MYR',
                    'gateway' => 'bayarcash',
                    'status' => $transactionStatus,
                    'payload' => $callbackData,
                ]
            );

            if ($transactionStatus === 'success') {
                $user = \App\Models\User::find($userId);
                $plan = \App\Models\SubscriptionPlan::find($planId);
                if ($user && $plan) {
                    $user->subscribeToPlan($plan, [
                        'payment_gateway' => 'bayarcash',
                        'transaction_id' => $transactionId,
                        'amount_paid' => $callbackData['amount'] ?? 0,
                    ]);
                }
            }
        }

        // Return 200 OK to acknowledge receipt
        return response()->json(['status' => 'received'], 200);
    }

    /**
     * Handle Bayarcash return (redirect back to website via GET)
     * This is the return_url where users are redirected after payment
     */
    public function bayarcashReturn(Request $request)
    {
        Log::info('Bayarcash Return Received', $request->all());

        $returnData = $request->all();

        // Validate checksum
        if (!$this->bayarcash->validateReturnChecksum($returnData)) {
            Log::warning('Bayarcash return: Invalid checksum', $returnData);
            // Don't expose security details to user
            return redirect()->route('payment.failed')
                ->with('error', 'Payment verification failed. Please contact support.');
        }

        $orderNumber = $returnData['order_number'] ?? null;
        $status = $returnData['status'] ?? null;

        if ($this->bayarcash->isSuccessful($status)) {
            return redirect()->route('payment.success')
                ->with('message', 'Payment successful!')
                ->with('order_number', $orderNumber)
                ->with('transaction_id', $returnData['transaction_id'] ?? null);
        } elseif ($this->bayarcash->isFailed($status)) {
            return redirect()->route('payment.failed')
                ->with('error', 'Payment was not successful. Please try again.')
                ->with('order_number', $orderNumber);
        } else {
            return redirect()->route('payment.pending')
                ->with('message', 'Payment is being processed.')
                ->with('order_number', $orderNumber);
        }
    }

    /**
     * Handle SenangPay callback/return
     * SenangPay uses the same URL for both callback and redirect
     */
    public function senangpayCallback(Request $request)
    {
        Log::info('SenangPay Callback Received', $request->all());

        $callbackData = $request->all();

        // Validate hash
        if (!$this->senangpay->validateCallbackHash($callbackData)) {
            Log::warning('SenangPay callback: Invalid hash', $callbackData);
            return redirect()->route('payment.failed')
                ->with('error', 'Payment verification failed. Please contact support.');
        }

        $orderId = $callbackData['order_id'] ?? null;
        $transactionId = $callbackData['transaction_id'] ?? null;
        $statusId = $callbackData['status_id'] ?? null;

        if (!$orderId || !$transactionId) {
            Log::error('SenangPay callback: Missing required fields', $callbackData);
            return redirect()->route('payment.failed')
                ->with('error', 'Invalid payment data received.');
        }

        $transactionStatus = $this->senangpay->isSuccessful($statusId) ? 'success' : 'failed';

        // Parse order id to find user and plan
        // Format: PLAN-{user_id}-{plan_id}-{timestamp}
        $parts = explode('-', $orderId);
        $userId = $parts[1] ?? null;
        $planId = $parts[2] ?? null;

        if ($userId) {
            \App\Models\Transaction::updateOrCreate(
                ['order_number' => $orderId],
                [
                    'user_id' => $userId,
                    'subscription_plan_id' => $planId,
                    'transaction_id' => $transactionId,
                    'amount' => $callbackData['amount'] ?? 0,
                    'currency' => 'MYR',
                    'gateway' => 'senangpay',
                    'status' => $transactionStatus,
                    'payload' => $callbackData,
                ]
            );

            if ($transactionStatus === 'success') {
                $user = \App\Models\User::find($userId);
                $plan = \App\Models\SubscriptionPlan::find($planId);
                if ($user && $plan) {
                    $user->subscribeToPlan($plan, [
                        'payment_gateway' => 'senangpay',
                        'transaction_id' => $transactionId,
                        'amount_paid' => $callbackData['amount'] ?? 0,
                    ]);
                }

                return redirect()->route('payment.success')
                    ->with('message', 'Payment successful!')
                    ->with('order_number', $orderId)
                    ->with('transaction_id', $transactionId);
            }
        }

        return redirect()->route('payment.failed')
            ->with('error', $callbackData['msg'] ?? 'Payment was not successful. Please try again.')
            ->with('order_number', $orderId);
    }

    /**
     * Payment success page
     */
    public function success(Request $request)
    {
        return inertia('Payment/Success', [
            'message' => session('message', 'Payment successful!'),
            'orderNumber' => session('order_number'),
            'transactionId' => session('transaction_id'),
        ]);
    }

    /**
     * Payment failed page
     */
    public function failed(Request $request)
    {
        return inertia('Payment/Failed', [
            'error' => session('error', 'Payment was not successful.'),
            'orderNumber' => session('order_number'),
        ]);
    }

    /**
     * Payment pending page
     */
    public function pending(Request $request)
    {
        return inertia('Payment/Pending', [
            'message' => session('message', 'Payment is being processed.'),
            'orderNumber' => session('order_number'),
        ]);
    }
}
