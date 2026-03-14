<?php

namespace Database\Seeders;

use App\Models\HalalRestaurant;
use Illuminate\Database\Seeder;

class HalalRestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = [
            [
                'name' => 'Hameediyah Restaurant',
                'address' => '164, Lebuh Campbell, 10100 George Town, Penang',
                'phone_number' => '04-261 1095',
                'sort_order' => 1,
            ],
            [
                'name' => 'Nasi Kandar Line Clear',
                'address' => '177, Jalan Penang, 10000 George Town, Penang',
                'phone_number' => '04-261 3440',
                'sort_order' => 2,
            ],
            [
                'name' => 'Restoran Kapitan',
                'address' => '93, Lebuh Chulia, 10200 George Town, Penang',
                'phone_number' => '04-264 1191',
                'sort_order' => 3,
            ],
            [
                'name' => 'Deen Maju Nasi Kandar',
                'address' => '170, Jalan Gurdwara, 10300 George Town, Penang',
                'phone_number' => '012-425 2421',
                'sort_order' => 4,
            ],
            [
                'name' => 'Nasi Kandar Pelita',
                'address' => '146, Jalan Penang, 10000 George Town, Penang',
                'phone_number' => '04-226 3620',
                'sort_order' => 5,
            ],
            [
                'name' => 'Lagenda House & Café',
                'address' => '2, Lebuh Carnarvon, 10100 George Town, Penang',
                'phone_number' => '04-251 9300',
                'sort_order' => 6,
            ],
            [
                'name' => 'Hameed Pata Mee Sotong',
                'address' => '5, Esplanade Park, Lebuh Light, 10300 George Town, Penang',
                'phone_number' => '013-431 9384',
                'sort_order' => 7,
            ],
            [
                'name' => 'Laksa Janggus',
                'address' => '338 MK I, Kampung Perlis, 11000 Balik Pulau, Penang',
                'phone_number' => '019-516 3007',
                'sort_order' => 8,
            ],
            [
                'name' => 'Ayu Mee Udang',
                'address' => '936B, Lengkok Kampung Masjid 2, 11920 Teluk Kumbar, Penang',
                'phone_number' => '012-465 2823',
                'sort_order' => 9,
            ],
            [
                'name' => 'Roti Canai Transfer Road',
                'address' => '114, Jalan Transfer, 10050 George Town, Penang',
                'phone_number' => '012-474 9320',
                'sort_order' => 10,
            ],
            [
                'name' => 'Bee Hwa Café',
                'address' => '10, Lebuh Dickens, 10050 George Town, Penang',
                'phone_number' => '04-261 7880',
                'sort_order' => 11,
            ],
            [
                'name' => 'Ali Nasi Lemak Daun Pisang',
                'address' => 'Beach Street, 10300 George Town, Penang',
                'phone_number' => '016-407 0717',
                'sort_order' => 12,
            ],
            [
                'name' => 'D\'Tandoor Restaurant',
                'address' => '18, Lebuh Leith, 10200 George Town, Penang',
                'phone_number' => '04-228 6935',
                'sort_order' => 13,
            ],
            [
                'name' => 'Sup Hameed',
                'address' => '48, Jalan Penang, 10000 George Town, Penang',
                'phone_number' => '04-261 5823',
                'sort_order' => 14,
            ],
            [
                'name' => 'Restoran Kassim Mustafa',
                'address' => '12, Lebuh Chulia, 10200 George Town, Penang',
                'phone_number' => '04-261 4856',
                'sort_order' => 15,
            ],
            [
                'name' => 'Nasi Kandar Kampung Melayu',
                'address' => 'A-29, Jalan Kampung Melayu, 11500 Ayer Itam, Penang',
                'phone_number' => '04-828 2533',
                'sort_order' => 16,
            ],
            [
                'name' => 'Sarkies Corner (E&O Hotel)',
                'address' => '10, Lebuh Farquhar, 10200 George Town, Penang',
                'phone_number' => '04-222 2000',
                'sort_order' => 17,
            ],
            [
                'name' => 'Astaka Taman Tun Sardon',
                'address' => 'Taman Tun Sardon, 11700 Gelugor, Penang',
                'phone_number' => '012-479 5633',
                'sort_order' => 18,
            ],
            [
                'name' => 'Tajuddin Hussain (Nasi Kandar)',
                'address' => '7, Jalan Dato Keramat, 10150 George Town, Penang',
                'phone_number' => '04-226 8743',
                'sort_order' => 19,
            ],
            [
                'name' => 'Nasi Dalca Penang (Medan Selera Taman Tun)',
                'address' => 'Jalan Tun Dr Awang, Taman Tun Sardon, 11700 Gelugor, Penang',
                'phone_number' => '012-488 7221',
                'sort_order' => 20,
            ],
        ];

        foreach ($restaurants as $restaurant) {
            HalalRestaurant::create(array_merge($restaurant, ['is_active' => true]));
        }
    }
}
