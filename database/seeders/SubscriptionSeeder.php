<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        // Plans — yearly pricing across the board.
        // max_services / max_categories null = unlimited.
        $plans = [
            [
                'name' => 'Starter Hub',
                'slug' => 'starter-hub',
                'price' => 199.00,
                'interval' => 'year',
                'is_popular' => false,
                'max_services' => 3,
                'max_categories' => 1,
                'description' => 'For solo freelancers testing the platform.',
                'features' => [
                    'Up to 3 active service listings',
                    '1 service category',
                    'Booking flow with chat & attachments',
                    'Reviews & freelancer replies',
                    'Calendar availability',
                    'Standard search ranking',
                    'Email support (48h)',
                ],
            ],
            [
                'name' => 'Premium Pro',
                'slug' => 'premium-pro',
                'price' => 599.00,
                'interval' => 'year',
                'is_popular' => true,
                'max_services' => 15,
                'max_categories' => 5,
                'description' => 'For working freelancers who want to grow.',
                'features' => [
                    'Up to 15 active service listings',
                    'Up to 5 service categories',
                    'Priority placement in browse',
                    'Verified Pro badge',
                    'Analytics dashboard (views, conversion)',
                    'Limited regional / featured spots',
                    'Email support (24h)',
                ],
            ],
            [
                'name' => 'Business Hub',
                'slug' => 'enterprise-hub',
                'price' => 1499.00,
                'interval' => 'year',
                'is_popular' => false,
                'max_services' => null,
                'max_categories' => null,
                'description' => 'For studios, agencies, and teams.',
                'features' => [
                    'Unlimited service listings',
                    'Unlimited service categories',
                    'Featured regional spots',
                    'Multi-staff sub-accounts (coming soon)',
                    'Dedicated account manager',
                    'White-label / API access',
                    'WhatsApp & phone priority support',
                ],
            ],
            [
                'name' => 'Madani',
                'slug' => 'madani',
                'price' => 0.00,
                'interval' => 'year',
                'is_popular' => false,
                'requires_approval' => true,
                'sponsored_by' => 'Government of Malaysia',
                'max_services' => 15,
                'max_categories' => 5,
                'description' => 'Sponsored access for eligible Malaysian citizens. Subject to approval.',
                'features' => [
                    'Sponsored by the Government',
                    'Full Premium Pro feature set',
                    'Application reviewed by an admin',
                    '12-month subscription on approval',
                ],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }

        // Gateways — only seed if missing, never clobber configured prod values.
        $gateways = [
            ['name' => 'Bayarcash', 'slug' => 'bayarcash', 'is_active' => true,  'mode' => 'sandbox', 'settings' => ['personal_access_token' => '', 'portal_key' => '', 'api_secret_key' => '']],
            ['name' => 'Senangpay', 'slug' => 'senangpay', 'is_active' => false, 'mode' => 'sandbox', 'settings' => ['merchant_id' => '', 'secret_key' => '']],
            ['name' => 'PayPal',    'slug' => 'paypal',    'is_active' => false, 'mode' => 'sandbox', 'settings' => ['client_id' => '', 'client_secret' => '']],
            ['name' => 'Stripe',    'slug' => 'stripe',    'is_active' => false, 'mode' => 'sandbox', 'settings' => ['publishable_key' => '', 'secret_key' => '']],
        ];

        foreach ($gateways as $gateway) {
            PaymentGateway::firstOrCreate(['slug' => $gateway['slug']], $gateway);
        }
    }
}
