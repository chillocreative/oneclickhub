<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SsmVerification extends Model
{
    protected $fillable = [
        'user_id',
        'document_path',
        'company_name',
        'registration_number',
        'expiry_date',
        'status',
        'ai_response',
        'admin_notes',
        'verified_by',
        'verified_at',
        'grace_period_ends_at',
        'services_hidden_at',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'verified_at' => 'datetime',
            'grace_period_ends_at' => 'datetime',
            'services_hidden_at' => 'datetime',
        ];
    }

    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_FAILED = 'failed';
    const STATUS_EXPIRED = 'expired';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isInGracePeriod(): bool
    {
        return $this->grace_period_ends_at && $this->grace_period_ends_at->isFuture() && $this->status !== self::STATUS_VERIFIED;
    }

    public function gracePeriodDaysRemaining(): int
    {
        if (!$this->grace_period_ends_at || $this->grace_period_ends_at->isPast()) {
            return 0;
        }

        return (int) now()->diffInDays($this->grace_period_ends_at, false);
    }

    public function isGraceExpired(): bool
    {
        return $this->grace_period_ends_at && $this->grace_period_ends_at->isPast() && $this->status !== self::STATUS_VERIFIED;
    }
}
