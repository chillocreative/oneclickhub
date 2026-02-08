<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone_number',
        'email',
        'password',
        'identity_document',
        'position',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get all subscriptions for the user
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the active subscription
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_CANCELLED])
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now());
            })
            ->latest();
    }

    /**
     * Get the current subscription plan
     */
    public function getCurrentPlanAttribute()
    {
        $subscription = $this->activeSubscription;
        return $subscription ? $subscription->plan : null;
    }

    /**
     * Check if user has an active subscription
     */
    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }

    /**
     * Subscribe to a plan
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function bankingDetail(): HasOne
    {
        return $this->hasOne(BankingDetail::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(FreelancerAvailability::class);
    }

    public function customerOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function freelancerOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'freelancer_id');
    }

    public function freelancerReviews(): HasMany
    {
        return $this->hasMany(Review::class, 'freelancer_id');
    }

    public function ssmVerification(): HasOne
    {
        return $this->hasOne(SsmVerification::class);
    }

    public function subscribeToPlan(SubscriptionPlan $plan, array $paymentData = []): Subscription
    {
        // Cancel any existing active subscription
        $this->subscriptions()
            ->where('status', Subscription::STATUS_ACTIVE)
            ->update(['status' => Subscription::STATUS_CANCELLED]);

        // Annual subscription: 365 days from now
        $endsAt = now()->addDays(365);

        $subscription = $this->subscriptions()->create([
            'subscription_plan_id' => $plan->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => $endsAt,
            'payment_gateway' => $paymentData['payment_gateway'] ?? null,
            'transaction_id' => $paymentData['transaction_id'] ?? null,
            'amount_paid' => $paymentData['amount_paid'] ?? $plan->price,
        ]);

        // Start 30-day SSM grace period for freelancers without SSM verification
        if ($this->hasRole('Freelancer') && !$this->ssmVerification) {
            $this->ssmVerification()->create([
                'status' => SsmVerification::STATUS_PENDING,
                'grace_period_ends_at' => now()->addDays(30),
            ]);
        }

        return $subscription;
    }

    public function ssmStatus(): string
    {
        $ssm = $this->ssmVerification;

        if (!$ssm) {
            return 'none';
        }

        if ($ssm->status === SsmVerification::STATUS_VERIFIED) {
            return 'verified';
        }

        if ($ssm->isInGracePeriod()) {
            return 'in_grace';
        }

        return 'expired';
    }

    public function canShowServices(): bool
    {
        $status = $this->ssmStatus();
        return $status === 'verified' || $status === 'in_grace';
    }

    public function ssmGraceDaysRemaining(): int
    {
        return $this->ssmVerification?->gracePeriodDaysRemaining() ?? 0;
    }
}

