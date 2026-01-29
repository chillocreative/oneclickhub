<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PaymentGateway;

class BayarcashService
{
    protected $gateway;
    protected $settings;
    protected $baseUrl;

    /**
     * Bayarcash Payment Channel Constants
     * Reference: https://api.webimpian.support/bayarcash/payment/payment-channel
     */
    const CHANNEL_FPX = 1;
    const CHANNEL_DUITNOW_ONLINE_BANKING = 5;
    const CHANNEL_LINECLEAR_EXPRESS = 2;
    const CHANNEL_DUITNOW_QR = 4;

    /**
     * Bayarcash Transaction Status Constants
     * Reference: https://api.webimpian.support/bayarcash/transaction/callback
     */
    const STATUS_NEW = 0;
    const STATUS_PENDING = 1;
    const STATUS_FAILED = 2;
    const STATUS_SUCCESS = 3;
    const STATUS_CANCELLED = 4;

    public function __construct()
    {
        $this->gateway = PaymentGateway::where('slug', 'bayarcash')->first();
        
        if ($this->gateway) {
            $this->settings = $this->gateway->settings ?? [];
            $this->baseUrl = $this->gateway->mode === 'live'
                ? 'https://api.console.bayar.cash/v3'
                : 'https://api.console.bayarcash-sandbox.com/v3';
        }
    }

    /**
     * Check if Bayarcash is configured and active
     */
    public function isAvailable(): bool
    {
        return $this->gateway 
            && $this->gateway->is_active 
            && !empty($this->settings['personal_access_token'])
            && !empty($this->settings['portal_key']);
    }

    /**
     * Get the Personal Access Token
     */
    protected function getToken(): string
    {
        return $this->settings['personal_access_token'] ?? '';
    }

    /**
     * Get the Portal Key
     */
    protected function getPortalKey(): string
    {
        return $this->settings['portal_key'] ?? '';
    }

    /**
     * Get the API Secret Key for checksum validation
     */
    protected function getSecretKey(): string
    {
        return $this->settings['api_secret_key'] ?? '';
    }

    /**
     * Create a payment intent
     * Reference: https://api.webimpian.support/bayarcash/payment/payment-intent
     *
     * @param array $data Payment data
     * @return array Response with payment URL or error
     */
    public function createPaymentIntent(array $data): array
    {
        if (!$this->isAvailable()) {
            return [
                'success' => false,
                'error' => 'Bayarcash is not configured or inactive'
            ];
        }

        try {
            $payload = [
                'payment_channel' => $data['payment_channel'] ?? self::CHANNEL_FPX,
                'portal_key' => $this->getPortalKey(),
                'order_number' => $data['order_number'],
                'amount' => $this->formatAmount($data['amount']),
                'payer_name' => $data['payer_name'],
                'payer_email' => $data['payer_email'],
            ];

            // Optional fields
            if (!empty($data['payer_telephone_number'])) {
                $payload['payer_telephone_number'] = $this->formatPhoneNumber($data['payer_telephone_number']);
            }

            if (!empty($data['return_url'])) {
                $payload['return_url'] = $data['return_url'];
            }

            if (!empty($data['callback_url'])) {
                $payload['callback_url'] = $data['callback_url'];
            }

            if (!empty($data['payer_bank_code'])) {
                $payload['payer_bank_code'] = $data['payer_bank_code'];
            }

            $response = Http::withToken($this->getToken())
                ->post("{$this->baseUrl}/payment-intents", $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'payment_intent_id' => $responseData['id'] ?? null,
                    'payment_url' => $responseData['url'] ?? null,
                    'data' => $responseData
                ];
            }

            Log::error('Bayarcash payment intent failed', [
                'response' => $response->body(),
                'status' => $response->status()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create payment intent',
                'details' => $response->json()
            ];
        } catch (\Exception $e) {
            Log::error('Bayarcash payment intent exception', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Validate callback checksum
     * Reference: https://api.webimpian.support/bayarcash/checksum/transaction-callback
     *
     * @param array $callbackData The callback data from Bayarcash
     * @return bool Whether the checksum is valid
     */
    public function validateCallbackChecksum(array $callbackData): bool
    {
        $secretKey = $this->getSecretKey();
        
        if (empty($secretKey)) {
            Log::warning('Bayarcash: API Secret Key not configured for checksum validation');
            return false;
        }

        $receivedChecksum = $callbackData['checksum'] ?? '';
        
        if (empty($receivedChecksum)) {
            return false;
        }

        // Build payload data for checksum validation (v3 callback_url format)
        $payloadData = [
            'record_type' => $callbackData['record_type'] ?? '',
            'transaction_id' => $callbackData['transaction_id'] ?? '',
            'exchange_reference_number' => $callbackData['exchange_reference_number'] ?? '',
            'exchange_transaction_id' => $callbackData['exchange_transaction_id'] ?? '',
            'order_number' => $callbackData['order_number'] ?? '',
            'currency' => $callbackData['currency'] ?? '',
            'amount' => $callbackData['amount'] ?? '',
            'payer_name' => $callbackData['payer_name'] ?? '',
            'payer_email' => $callbackData['payer_email'] ?? '',
            'payer_bank_name' => $callbackData['payer_bank_name'] ?? '',
            'status' => $callbackData['status'] ?? '',
            'status_description' => $callbackData['status_description'] ?? '',
            'datetime' => $callbackData['datetime'] ?? '',
        ];

        // Sort by key as per documentation
        ksort($payloadData);

        // Concatenate values with '|'
        $payloadString = implode('|', $payloadData);

        // Generate checksum using HMAC SHA256
        $calculatedChecksum = hash_hmac('sha256', $payloadString, $secretKey);

        return hash_equals($calculatedChecksum, $receivedChecksum);
    }

    /**
     * Validate return URL checksum (v3 format - different from callback)
     * Reference: https://api.webimpian.support/bayarcash/checksum/transaction-callback
     *
     * @param array $returnData The return URL data from Bayarcash
     * @return bool Whether the checksum is valid
     */
    public function validateReturnChecksum(array $returnData): bool
    {
        $secretKey = $this->getSecretKey();
        
        if (empty($secretKey)) {
            Log::warning('Bayarcash: API Secret Key not configured for checksum validation');
            return false;
        }

        $receivedChecksum = $returnData['checksum'] ?? '';
        
        if (empty($receivedChecksum)) {
            return false;
        }

        // Build payload data for return URL checksum validation (v3 format)
        $payloadData = [
            'transaction_id' => $returnData['transaction_id'] ?? '',
            'exchange_reference_number' => $returnData['exchange_reference_number'] ?? '',
            'exchange_transaction_id' => $returnData['exchange_transaction_id'] ?? '',
            'order_number' => $returnData['order_number'] ?? '',
            'currency' => $returnData['currency'] ?? '',
            'amount' => $returnData['amount'] ?? '',
            'payer_bank_name' => $returnData['payer_bank_name'] ?? '',
            'status' => $returnData['status'] ?? '',
            'status_description' => $returnData['status_description'] ?? '',
        ];

        // Sort by key as per documentation
        ksort($payloadData);

        // Concatenate values with '|'
        $payloadString = implode('|', $payloadData);

        // Generate checksum using HMAC SHA256
        $calculatedChecksum = hash_hmac('sha256', $payloadString, $secretKey);

        return hash_equals($calculatedChecksum, $receivedChecksum);
    }

    /**
     * Check if the transaction status indicates success
     *
     * @param int|string $status The status value from callback
     * @return bool Whether the payment was successful
     */
    public function isSuccessful($status): bool
    {
        return (int) $status === self::STATUS_SUCCESS;
    }

    /**
     * Check if the transaction status indicates failure
     *
     * @param int|string $status The status value from callback
     * @return bool Whether the payment failed
     */
    public function isFailed($status): bool
    {
        return in_array((int) $status, [self::STATUS_FAILED, self::STATUS_CANCELLED]);
    }

    /**
     * Check if the transaction is still pending
     *
     * @param int|string $status The status value from callback
     * @return bool Whether the payment is pending
     */
    public function isPending($status): bool
    {
        return in_array((int) $status, [self::STATUS_NEW, self::STATUS_PENDING]);
    }

    /**
     * Get human-readable status description
     *
     * @param int|string $status The status value
     * @return string Status description
     */
    public function getStatusDescription($status): string
    {
        $statuses = [
            self::STATUS_NEW => 'New',
            self::STATUS_PENDING => 'Pending',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_SUCCESS => 'Success',
            self::STATUS_CANCELLED => 'Cancelled',
        ];

        return $statuses[(int) $status] ?? 'Unknown';
    }

    /**
     * Get transaction details by ID
     * Reference: https://api.webimpian.support/bayarcash/transaction/transaction-id
     *
     * @param string $transactionId The transaction ID
     * @return array Transaction details or error
     */
    public function getTransaction(string $transactionId): array
    {
        if (!$this->isAvailable()) {
            return [
                'success' => false,
                'error' => 'Bayarcash is not configured or inactive'
            ];
        }

        try {
            $response = Http::withToken($this->getToken())
                ->get("{$this->baseUrl}/transactions/{$transactionId}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'error' => 'Failed to get transaction',
                'details' => $response->json()
            ];
        } catch (\Exception $e) {
            Log::error('Bayarcash get transaction exception', [
                'transaction_id' => $transactionId,
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format amount to cents (Bayarcash expects amount in cents)
     *
     * @param float|int $amount Amount in ringgit
     * @return int Amount in cents
     */
    protected function formatAmount($amount): int
    {
        return (int) round($amount * 100);
    }

    /**
     * Format phone number for Malaysia
     *
     * @param string $phone Phone number
     * @return string Formatted phone number
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0, replace with 60
        if (str_starts_with($phone, '0')) {
            $phone = '60' . substr($phone, 1);
        }

        // If doesn't start with 60, add it
        if (!str_starts_with($phone, '60')) {
            $phone = '60' . $phone;
        }

        return $phone;
    }
}
