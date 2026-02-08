<?php

namespace Database\Seeders;

use App\Models\BankingDetail;
use App\Models\FreelancerAvailability;
use App\Models\Order;
use App\Models\Review;
use App\Models\Service;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ServiceCategorySeeder::class,
            UserSeeder::class,
            SubscriptionSeeder::class,
        ]);

        // Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@oneclickhub.com',
            'phone_number' => '0123456789',
            'password' => 'admin123',
        ]);
        $admin->assignRole('Admin');

        // Freelancer
        $freelancer = User::create([
            'name' => 'Freelancer Demo',
            'email' => 'freelancer@oneclickhub.com',
            'phone_number' => '0187654321',
            'password' => 'freelancer123',
            'position' => 'Web Developer',
        ]);
        $freelancer->assignRole('Freelancer');

        // Customer
        $customer = User::create([
            'name' => 'Customer Demo',
            'email' => 'customer@oneclickhub.com',
            'phone_number' => '0198765432',
            'password' => 'customer123',
        ]);
        $customer->assignRole('Customer');

        // --- Demo data for Freelancer ---

        // Give freelancer an active subscription
        $plan = SubscriptionPlan::first();
        if ($plan) {
            Subscription::create([
                'user_id' => $freelancer->id,
                'subscription_plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addDays(365),
                'amount_paid' => $plan->price,
            ]);
        }

        // Banking details
        BankingDetail::create([
            'user_id' => $freelancer->id,
            'bank_name' => 'Maybank',
            'account_number' => '1234567890',
            'account_holder_name' => 'Freelancer Demo',
        ]);

        // Calendar availability (next 14 days, skip weekends)
        for ($i = 1; $i <= 14; $i++) {
            $date = now()->addDays($i);
            if ($date->isWeekday()) {
                FreelancerAvailability::create([
                    'user_id' => $freelancer->id,
                    'date' => $date->format('Y-m-d'),
                    'type' => 'available',
                ]);
            }
        }

        // Services
        $service1 = Service::create([
            'user_id' => $freelancer->id,
            'service_category_id' => 7, // Web Designer
            'title' => 'Professional Website Development',
            'description' => "I will build a modern, responsive website for your business using the latest technologies including Laravel, React, and Tailwind CSS.\n\nWhat you'll get:\n- Custom design tailored to your brand\n- Mobile-responsive layout\n- SEO-friendly structure\n- Contact form integration\n- Up to 5 pages\n- 2 rounds of revision\n\nPerfect for small businesses, startups, and personal brands looking for a professional online presence.",
            'price_from' => 500.00,
            'price_to' => 2000.00,
            'delivery_days' => 7,
            'tags' => ['website', 'laravel', 'react', 'responsive', 'tailwind'],
            'is_active' => true,
        ]);

        $service2 = Service::create([
            'user_id' => $freelancer->id,
            'service_category_id' => 6, // Graphic Designer
            'title' => 'Logo & Brand Identity Design',
            'description' => "I will create a unique and memorable logo and brand identity for your business.\n\nPackage includes:\n- 3 initial logo concepts\n- Unlimited revisions on chosen concept\n- Final files in PNG, SVG, PDF formats\n- Brand color palette\n- Typography guidelines\n- Business card design\n\nI specialize in clean, modern designs that make your brand stand out.",
            'price_from' => 200.00,
            'price_to' => 800.00,
            'delivery_days' => 5,
            'tags' => ['logo', 'branding', 'graphic design', 'identity'],
            'is_active' => true,
        ]);

        $service3 = Service::create([
            'user_id' => $freelancer->id,
            'service_category_id' => 7, // Web Designer
            'title' => 'E-Commerce Store Setup',
            'description' => "I will set up a fully functional e-commerce store for your business.\n\nIncludes:\n- Product catalog setup (up to 50 products)\n- Payment gateway integration\n- Shipping configuration\n- Order management system\n- Customer account system\n- Mobile-optimized design\n\nBuilt on reliable platforms with secure checkout.",
            'price_from' => 1500.00,
            'price_to' => 5000.00,
            'delivery_days' => 14,
            'tags' => ['ecommerce', 'online store', 'shopify', 'woocommerce'],
            'is_active' => true,
        ]);

        // --- Demo order: Customer booked service1 ---

        // A completed order with review
        $completedDate = now()->subDays(10)->format('Y-m-d');
        $completedOrder = Order::create([
            'customer_id' => $customer->id,
            'freelancer_id' => $freelancer->id,
            'service_id' => $service1->id,
            'booking_date' => $completedDate,
            'agreed_price' => 800.00,
            'customer_notes' => 'I need a website for my bakery business with online ordering.',
            'status' => Order::STATUS_COMPLETED,
            'payment_slip_uploaded_at' => now()->subDays(10),
            'freelancer_responded_at' => now()->subDays(9),
            'delivered_at' => now()->subDays(3),
            'completed_at' => now()->subDays(2),
        ]);

        Review::create([
            'order_id' => $completedOrder->id,
            'customer_id' => $customer->id,
            'freelancer_id' => $freelancer->id,
            'service_id' => $service1->id,
            'rating' => 5,
            'comment' => 'Excellent work! The website looks amazing and was delivered on time. Highly recommended!',
        ]);

        // An active order (in progress)
        $activeDate = now()->addDays(3)->format('Y-m-d');
        Order::create([
            'customer_id' => $customer->id,
            'freelancer_id' => $freelancer->id,
            'service_id' => $service2->id,
            'booking_date' => $activeDate,
            'agreed_price' => 350.00,
            'customer_notes' => 'Need a logo for my new cafe. I like minimalist style with earth tones.',
            'status' => Order::STATUS_ACTIVE,
            'payment_slip_uploaded_at' => now()->subDays(1),
            'freelancer_responded_at' => now(),
        ]);

        // A pending payment order
        $pendingDate = now()->addDays(7)->format('Y-m-d');
        Order::create([
            'customer_id' => $customer->id,
            'freelancer_id' => $freelancer->id,
            'service_id' => $service3->id,
            'booking_date' => $pendingDate,
            'agreed_price' => 2500.00,
            'customer_notes' => 'I want to sell handmade crafts online. Need about 30 products listed initially.',
            'status' => Order::STATUS_PENDING_PAYMENT,
        ]);
    }
}
