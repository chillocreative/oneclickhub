<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Advertisement extends Model
{
    protected $fillable = ['title', 'description', 'image', 'link', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return Storage::disk('public')->url($this->image);
    }
}
