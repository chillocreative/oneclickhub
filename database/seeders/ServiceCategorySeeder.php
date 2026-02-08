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
            'Content Writer',
            'Social Media Manager',
            'Digital Marketing',
            'Video Editor',
            'Voice Over Artist',
            'Virtual Assistant',
            'Translation',
            'Music & Audio',
            'Interior Design',
            'Personal Trainer',
            'Tutor / Educator',
            'Mobile App Developer',
            'Data Entry',
            'Accounting & Bookkeeping',
            'Legal Consultant',
        ];

        foreach ($categories as $category) {
            \App\Models\ServiceCategory::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($category)],
                ['name' => $category],
            );
        }
    }
}
