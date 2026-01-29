<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'transaction_id',
        'order_number',
        'amount',
        'currency',
        'gateway',
        'status',
        'payment_method',
        'payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payload' => 'array',
    ];

    /**
     * Transaction status constants
     */
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';
    const STATUS_PENDING = 'pending';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the user that made the transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related subscription plan
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->amount, 2);
    }
}
