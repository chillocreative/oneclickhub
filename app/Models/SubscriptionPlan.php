<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'price', 'interval', 'features', 'is_active', 'is_popular', 'description'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'price' => 'decimal:2',
    ];

    // Note: subscribers_count is NOT in appends to avoid errors when subscriptions table doesn't exist
    protected $appends = ['formatted_price'];

    /**
     * Boot method to auto-generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($plan) {
            if (empty($plan->slug)) {
                $plan->slug = Str::slug($plan->name);
            }
        });

        static::updating(function ($plan) {
            if ($plan->isDirty('name') && !$plan->isDirty('slug')) {
                $plan->slug = Str::slug($plan->name);
            }
        });
    }

    /**
     * Get all subscriptions for this plan
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get count of active subscribers (safe method that won't error if table doesn't exist)
     */
    public function getSubscribersCountAttribute(): int
    {
        try {
            if (!Schema::hasTable('subscriptions')) {
                return 0;
            }
            return $this->subscriptions()
                ->where('status', Subscription::STATUS_ACTIVE)
                ->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get formatted price with currency
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'RM ' . number_format($this->price, 2);
    }

    /**
     * Get interval label
     */
    public function getIntervalLabelAttribute(): string
    {
        return $this->interval === 'year' ? '/yr' : '/mo';
    }
}


