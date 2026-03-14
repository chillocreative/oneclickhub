<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HalalRestaurant extends Model
{
    protected $fillable = ['name', 'address', 'phone_number', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
