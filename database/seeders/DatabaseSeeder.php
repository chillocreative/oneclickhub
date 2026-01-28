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

        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'phone_number' => '1111111111',
            'password' => 'password',
        ]);
        $admin->assignRole('Admin');

        $admin2 = User::create([
            'name' => 'Admin Two',
            'email' => 'admin2@example.com',
            'phone_number' => '01110019843',
            'password' => 'password',
        ]);
        $admin2->assignRole('Admin');

        $user = User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'phone_number' => '2222222222',
            'password' => 'password',
        ]);
        $user->assignRole('General User');
    }
}
