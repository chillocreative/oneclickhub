<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ServiceCategorySeeder::class,
            UserSeeder::class,
            SubscriptionSeeder::class,
        ]);

        // Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@oneclickhub.com',
            'phone_number' => '0123456789',
            'password' => 'admin123',
        ]);
        $admin->assignRole('Admin');

        // Regular User (Freelancer)
        $regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'user@oneclickhub.com',
            'phone_number' => '0198765432',
            'password' => 'user123',
        ]);
        $regularUser->assignRole('General User');
    }
}
