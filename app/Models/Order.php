<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    const STATUS_PENDING_PAYMENT = 'pending_payment';
    const STATUS_PENDING_APPROVAL = 'pending_approval';
    const STATUS_ACTIVE = 'active';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'order_number',
        'customer_id',
        'freelancer_id',
        'service_id',
        'booking_date',
        'agreed_price',
        'customer_notes',
        'payment_slip',
        'status',
        'payment_slip_uploaded_at',
        'freelancer_responded_at',
        'delivery_deadline_at',
        'delivered_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'agreed_price' => 'decimal:2',
            'payment_slip_uploaded_at' => 'datetime',
            'freelancer_responded_at' => 'datetime',
            'delivery_deadline_at' => 'datetime',
            'delivered_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'OCH-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'freelancer_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(ChatConversation::class, 'order_id');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING_PAYMENT, self::STATUS_PENDING_APPROVAL]);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeForFreelancer($query, $id)
    {
        return $query->where('freelancer_id', $id);
    }

    public function scopeForCustomer($query, $id)
    {
        return $query->where('customer_id', $id);
    }
}
