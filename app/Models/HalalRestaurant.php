<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HalalRestaurant extends Model
{
    protected $fillable = [
        'place_id',
        'name',
        'address',
        'phone_number',
        'rating',
        'rating_count',
        'cuisine_type',
        'photo_url',
        'latitude',
        'longitude',
        'google_maps_url',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'rating' => 'decimal:1',
        'rating_count' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];
}
