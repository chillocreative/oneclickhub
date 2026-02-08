<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreelancerAvailability extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'type',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('type', 'available');
    }

    public function scopeBlocked($query)
    {
        return $query->where('type', 'blocked');
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
