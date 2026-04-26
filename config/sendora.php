<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sendora WhatsApp Blaster
    |--------------------------------------------------------------------------
    | The Sendora app at D:\laragon\www\blaster exposes
    |   POST /api/v1/send-message  { device_id, to, message }
    | behind a Sanctum token.
    */

    'base_url' => env('SENDORA_BASE_URL', 'http://localhost:8000'),
    'api_token' => env('SENDORA_API_TOKEN', ''),
    'device_id' => env('SENDORA_DEVICE_ID', ''),

    // Phone number that should receive admin alerts (new subscriptions, etc.)
    'admin_phone' => env('SENDORA_ADMIN_PHONE', ''),

    // Minimum gap between consecutive admin alerts so the recipient
    // device doesn't get rate-limited or flagged as spam.
    'admin_throttle_minutes' => env('SENDORA_ADMIN_THROTTLE_MINUTES', 30),

    // Default country prefix used when normalising phone numbers.
    'country_prefix' => env('SENDORA_COUNTRY_PREFIX', '6'),
];
