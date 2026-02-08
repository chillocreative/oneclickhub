<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Freelancers
        $freelancers = [
            ['name' => 'Simon Ryles', 'phone_number' => '0111234567', 'email' => 'SimonRyles@minible.com', 'position' => 'Full Stack Developer'],
            ['name' => 'Marion Walker', 'phone_number' => '0112345678', 'email' => 'MarionWalker@minible.com', 'position' => 'Frontend Developer'],
            ['name' => 'Frederick White', 'phone_number' => '0113456789', 'email' => 'FrederickWhite@minible.com', 'position' => 'UI/UX Designer'],
            ['name' => 'Shanon Marvin', 'phone_number' => '0114561234', 'email' => 'ShanonMarvin@minible.com', 'position' => 'Backend Developer'],
            ['name' => 'Mark Jones', 'phone_number' => '0115672345', 'email' => 'MarkJones@minible.com', 'position' => 'Mobile Specialist'],
        ];

        foreach ($freelancers as $data) {
            $user = User::updateOrCreate(
                ['phone_number' => $data['phone_number']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'position' => $data['position'],
                    'password' => 'password',
                ]
            );
            if (!$user->hasRole('Freelancer')) {
                $user->assignRole('Freelancer');
            }
        }

        // Seed Customers
        $customers = [
            ['name' => 'Alice Tan', 'phone_number' => '0123344556', 'email' => 'alice@example.com'],
            ['name' => 'John Doe', 'phone_number' => '0145566778', 'email' => 'john.doe@example.com'],
            ['name' => 'Siti Aminah', 'phone_number' => '0178899001', 'email' => 'siti@example.com'],
        ];

        foreach ($customers as $data) {
            $user = User::updateOrCreate(
                ['phone_number' => $data['phone_number']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => 'password',
                ]
            );
            if (!$user->hasRole('Customer')) {
                $user->assignRole('Customer');
            }
        }
    }
}
