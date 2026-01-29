<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        // Plans
        $plans = [
            [
                'name' => 'Starter Hub',
                'slug' => 'starter-hub',
                'price' => 49.00,
                'interval' => 'month',
                'is_popular' => false,
                'features' => ['5 Service Categories', 'Basic Dashboard', 'WhatsApp Leads Notifications', 'Community Access'],
            ],
            [
                'name' => 'Premium Pro',
                'slug' => 'premium-pro',
                'price' => 199.00,
                'interval' => 'month',
                'is_popular' => true,
                'features' => ['Unlimited Categories', 'Advanced Analytics Hub', 'Full WhatsApp Config', 'Priority Leads Filter', 'Regional Exposure'],
            ],
            [
                'name' => 'Enterprise Hub',
                'slug' => 'enterprise-hub',
                'price' => 999.00,
                'interval' => 'year',
                'is_popular' => false,
                'features' => ['Custom Reporting', 'White Label Options', 'API Access', 'Dedicated Support Manager', 'Multi-country Market Reach'],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }

        // Gateways
        $gateways = [
            [
                'name' => 'Bayarcash',
                'slug' => 'bayarcash',
                'is_active' => true,
                'mode' => 'sandbox',
                'settings' => [
                    'personal_access_token' => '',
                    'portal_key' => '',
                    'api_secret_key' => '',
                ]
            ],
            [
                'name' => 'Senangpay',
                'slug' => 'senangpay',
                'is_active' => false,
                'mode' => 'sandbox',
                'settings' => [
                    'merchant_id' => '',
                    'secret_key' => '',
                ]
            ],
            [
                'name' => 'PayPal',
                'slug' => 'paypal',
                'is_active' => false,
                'mode' => 'sandbox',
                'settings' => [
                    'client_id' => '',
                    'client_secret' => '',
                ]
            ],
            [
                'name' => 'Stripe',
                'slug' => 'stripe',
                'is_active' => false,
                'mode' => 'sandbox',
                'settings' => [
                    'publishable_key' => '',
                    'secret_key' => '',
                ]
            ],
        ];

        foreach ($gateways as $gateway) {
            PaymentGateway::updateOrCreate(['slug' => $gateway['slug']], $gateway);
        }
    }
}
