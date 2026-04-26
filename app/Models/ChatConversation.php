<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatConversation extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'order_id',
        'service_id',
        'type',
        'last_message_at',
        'deleted_by_user_one_at',
        'deleted_by_user_two_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'deleted_by_user_one_at' => 'datetime',
            'deleted_by_user_two_at' => 'datetime',
        ];
    }

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_one_id', $userId)
                ->orWhere('user_two_id', $userId);
        });
    }

    public function scopeNotDeletedFor($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where(function ($qq) use ($userId) {
                $qq->where('user_one_id', $userId)
                    ->whereNull('deleted_by_user_one_at');
            })->orWhere(function ($qq) use ($userId) {
                $qq->where('user_two_id', $userId)
                    ->whereNull('deleted_by_user_two_at');
            });
        });
    }

    public function getOtherUser($userId): ?User
    {
        return $this->user_one_id === $userId ? $this->userTwo : $this->userOne;
    }

    public function isDeletedFor(int $userId): bool
    {
        if ($this->user_one_id === $userId) {
            return $this->deleted_by_user_one_at !== null;
        }
        if ($this->user_two_id === $userId) {
            return $this->deleted_by_user_two_at !== null;
        }
        return false;
    }

    public function markDeletedFor(int $userId): void
    {
        if ($this->user_one_id === $userId) {
            $this->deleted_by_user_one_at = now();
        } elseif ($this->user_two_id === $userId) {
            $this->deleted_by_user_two_at = now();
        }

        // Both sides have deleted: hard-delete the whole conversation.
        if ($this->deleted_by_user_one_at && $this->deleted_by_user_two_at) {
            $this->messages()->delete();
            $this->delete();
            return;
        }

        $this->save();
    }

    public function clearDeletedFor(int $userId): void
    {
        if ($this->user_one_id === $userId && $this->deleted_by_user_one_at) {
            $this->deleted_by_user_one_at = null;
            $this->save();
        } elseif ($this->user_two_id === $userId && $this->deleted_by_user_two_at) {
            $this->deleted_by_user_two_at = null;
            $this->save();
        }
    }
}
