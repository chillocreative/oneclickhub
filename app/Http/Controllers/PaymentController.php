<?php

namespace App\Http\Controllers;

use App\Services\BayarcashService;
use App\Services\SenangpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        if ($this->bayarcash->isSuccessful($status)) {
            // Payment successful - update your order/subscription
            Log::info("Bayarcash payment successful for order: {$orderNumber}", [
                'transaction_id' => $transactionId,
                'amount' => $callbackData['amount'] ?? null,
            ]);

            // TODO: Implement your business logic here
            // Example: Update order status, activate subscription, send email, etc.
            // $order = Order::where('order_number', $orderNumber)->first();
            // $order?->markAsPaid($transactionId);

        } elseif ($this->bayarcash->isFailed($status)) {
            // Payment failed
            Log::info("Bayarcash payment failed for order: {$orderNumber}", [
                'transaction_id' => $transactionId,
                'status' => $status,
                'status_description' => $callbackData['status_description'] ?? null,
            ]);

            // TODO: Handle failed payment
            // $order = Order::where('order_number', $orderNumber)->first();
            // $order?->markAsFailed();

        } else {
            // Payment pending or other status
            Log::info("Bayarcash payment pending for order: {$orderNumber}", [
                'transaction_id' => $transactionId,
                'status' => $status,
                'status_description' => $callbackData['status_description'] ?? null,
            ]);
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

        if ($this->senangpay->isSuccessful($statusId)) {
            // Payment successful
            Log::info("SenangPay payment successful for order: {$orderId}", [
                'transaction_id' => $transactionId,
            ]);

            // TODO: Implement your business logic here
            // $order = Order::where('order_number', $orderId)->first();
            // $order?->markAsPaid($transactionId);

            return redirect()->route('payment.success')
                ->with('message', 'Payment successful!')
                ->with('order_number', $orderId)
                ->with('transaction_id', $transactionId);
        } else {
            // Payment failed
            Log::info("SenangPay payment failed for order: {$orderId}", [
                'transaction_id' => $transactionId,
                'status_id' => $statusId,
                'msg' => $callbackData['msg'] ?? null,
            ]);

            // TODO: Handle failed payment
            // $order = Order::where('order_number', $orderId)->first();
            // $order?->markAsFailed();

            return redirect()->route('payment.failed')
                ->with('error', $callbackData['msg'] ?? 'Payment was not successful. Please try again.')
                ->with('order_number', $orderId);
        }
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
