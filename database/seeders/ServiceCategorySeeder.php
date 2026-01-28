<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Catering',
            'Event Hall',
            'Event Planner',
            'Make Up Artist',
            'Photography/Videography',
            'Graphic Designer',
            'Web Designer',
            'Proofreading',
        ];

        foreach ($categories as $category) {
            \App\Models\ServiceCategory::create([
                'name' => $category,
                'slug' => \Illuminate\Support\Str::slug($category),
            ]);
        }
    }
}
