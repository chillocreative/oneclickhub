<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PaymentGateway;

class SenangpayService
{
    protected $gateway;
    protected $settings;
    protected $baseUrl;

    /**
     * SenangPay Transaction Status Constants
     */
    const STATUS_SUCCESSFUL = '1';
    const STATUS_FAILED = '0';

    public function __construct()
    {
        $this->gateway = PaymentGateway::where('slug', 'senangpay')->first();
        
        if ($this->gateway) {
            $this->settings = $this->gateway->settings ?? [];
            $this->baseUrl = $this->gateway->mode === 'live'
                ? 'https://app.senangpay.my/payment'
                : 'https://sandbox.senangpay.my/payment';
        }
    }

    /**
     * Check if SenangPay is configured and active
     */
    public function isAvailable(): bool
    {
        return $this->gateway 
            && $this->gateway->is_active 
            && !empty($this->settings['merchant_id'])
            && !empty($this->settings['secret_key']);
    }

    /**
     * Get the Merchant ID
     */
    protected function getMerchantId(): string
    {
        return $this->settings['merchant_id'] ?? '';
    }

    /**
     * Get the Secret Key
     */
    protected function getSecretKey(): string
    {
        return $this->settings['secret_key'] ?? '';
    }

    /**
     * Generate payment URL with hash
     * Reference: SenangPay Shopping Cart Integration
     *
     * @param array $data Payment data
     * @return array Response with payment URL or error
     */
    public function createPayment(array $data): array
    {
        if (!$this->isAvailable()) {
            return [
                'success' => false,
                'error' => 'SenangPay is not configured or inactive'
            ];
        }

        try {
            $merchantId = $this->getMerchantId();
            $secretKey = $this->getSecretKey();

            // Required parameters
            $detail = $data['detail'] ?? $data['description'] ?? 'Payment';
            $amount = $this->formatAmount($data['amount']);
            $orderId = $data['order_id'] ?? $data['order_number'];
            
            // Generate hash
            // Hash format: md5(secretkey . detail . amount . order_id)
            // Or SHA256 if configured
            $hashString = $secretKey . $detail . $amount . $orderId;
            $hash = hash('sha256', $hashString);

            // Build payment URL parameters
            $params = [
                'detail' => $detail,
                'amount' => $amount,
                'order_id' => $orderId,
                'hash' => $hash,
            ];

            // Optional parameters
            if (!empty($data['name'])) {
                $params['name'] = $data['name'];
            }

            if (!empty($data['email'])) {
                $params['email'] = $data['email'];
            }

            if (!empty($data['phone'])) {
                $params['phone'] = $data['phone'];
            }

            // Build the payment URL
            $paymentUrl = "{$this->baseUrl}/{$merchantId}?" . http_build_query($params);

            return [
                'success' => true,
                'payment_url' => $paymentUrl,
                'order_id' => $orderId,
                'hash' => $hash
            ];
        } catch (\Exception $e) {
            Log::error('SenangPay create payment exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Validate callback/return hash
     * Reference: SenangPay documentation
     *
     * The hash is calculated as: sha256(secretkey + status_id + order_id + transaction_id + msg)
     *
     * @param array $callbackData The callback data from SenangPay
     * @return bool Whether the hash is valid
     */
    public function validateCallbackHash(array $callbackData): bool
    {
        $secretKey = $this->getSecretKey();
        
        if (empty($secretKey)) {
            Log::warning('SenangPay: Secret Key not configured for hash validation');
            return false;
        }

        $receivedHash = $callbackData['hash'] ?? '';
        
        if (empty($receivedHash)) {
            return false;
        }

        // Build hash string according to SenangPay documentation
        // Format: secretkey + status_id + order_id + transaction_id + msg
        $statusId = $callbackData['status_id'] ?? '';
        $orderId = $callbackData['order_id'] ?? '';
        $transactionId = $callbackData['transaction_id'] ?? '';
        $msg = $callbackData['msg'] ?? '';

        $hashString = $secretKey . $statusId . $orderId . $transactionId . $msg;
        $calculatedHash = hash('sha256', $hashString);

        return hash_equals($calculatedHash, $receivedHash);
    }

    /**
     * Check if the transaction status indicates success
     *
     * @param string $statusId The status_id value from callback
     * @return bool Whether the payment was successful
     */
    public function isSuccessful($statusId): bool
    {
        return (string) $statusId === self::STATUS_SUCCESSFUL;
    }

    /**
     * Check if the transaction status indicates failure
     *
     * @param string $statusId The status_id value from callback
     * @return bool Whether the payment failed
     */
    public function isFailed($statusId): bool
    {
        return (string) $statusId === self::STATUS_FAILED;
    }

    /**
     * Get human-readable status description
     *
     * @param string $statusId The status_id value
     * @return string Status description
     */
    public function getStatusDescription($statusId): string
    {
        return (string) $statusId === self::STATUS_SUCCESSFUL 
            ? 'Successful' 
            : 'Failed';
    }

    /**
     * Query order status by order ID
     * Reference: SenangPay API documentation
     *
     * @param string $orderId The order ID
     * @return array Order status or error
     */
    public function getOrderStatus(string $orderId): array
    {
        if (!$this->isAvailable()) {
            return [
                'success' => false,
                'error' => 'SenangPay is not configured or inactive'
            ];
        }

        try {
            $merchantId = $this->getMerchantId();
            $secretKey = $this->getSecretKey();

            // Generate hash for query
            // Format: sha256(merchantId + secretKey + orderId)
            $hashString = $merchantId . $secretKey . $orderId;
            $hash = hash('sha256', $hashString);

            $queryUrl = $this->gateway->mode === 'live'
                ? 'https://app.senangpay.my/apiv1/query_order_status'
                : 'https://sandbox.senangpay.my/apiv1/query_order_status';

            $response = Http::post($queryUrl, [
                'merchant_id' => $merchantId,
                'order_id' => $orderId,
                'hash' => $hash
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to query order status',
                'details' => $response->json()
            ];
        } catch (\Exception $e) {
            Log::error('SenangPay query order status exception', [
                'order_id' => $orderId,
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format amount to 2 decimal places
     *
     * @param float|int $amount Amount in ringgit
     * @return string Formatted amount
     */
    protected function formatAmount($amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
