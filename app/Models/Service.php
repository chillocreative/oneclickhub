<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory;

    protected $appends = ['image_urls'];

    protected $fillable = [
        'user_id',
        'service_category_id',
        'title',
        'slug',
        'description',
        'price_from',
        'price_to',
        'delivery_days',
        'always_available',
        'tags',
        'images',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'images' => 'array',
            'price_from' => 'decimal:2',
            'price_to' => 'decimal:2',
            'is_active' => 'boolean',
            'always_available' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Service $service) {
            if (empty($service->slug)) {
                $service->slug = Str::slug($service->title) . '-' . Str::random(6);
            }
        });
    }

    public function getImageUrlsAttribute(): array
    {
        return collect($this->images)->map(fn ($path) => $path ? Storage::disk('public')->url($path) : null)->filter()->values()->toArray();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('service_category_id', $categoryId);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
