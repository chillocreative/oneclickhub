<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'payment_gateway',
        'transaction_id',
        'amount_paid',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    /**
     * Subscription status constants
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_EXPIRED = 'expired';
    const STATUS_PENDING = 'pending';

    /**
     * Get the user that owns the subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subscription plan
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * Scope to get active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_ACTIVE, self::STATUS_CANCELLED])
            ->where(function ($q) {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            });
    }

    /**
     * Check if subscription is active (cancelled subscriptions remain active until ends_at)
     */
    public function isActive(): bool
    {
        if ($this->ends_at !== null && $this->ends_at->isPast()) {
            return false;
        }

        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_CANCELLED]);
    }

    /**
     * Check if subscription is expired
     */
    public function isExpired(): bool
    {
        return $this->ends_at !== null && $this->ends_at->isPast();
    }

    /**
     * Get the remaining days
     */
    public function getRemainingDaysAttribute(): ?int
    {
        if ($this->ends_at === null) {
            return null;
        }
        
        return max(0, now()->diffInDays($this->ends_at, false));
    }
}
