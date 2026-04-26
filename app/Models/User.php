<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'company_name',
        'business_name',
        'phone_number',
        'address',
        'email',
        'password',
        'must_change_password',
        'identity_document',
        'profile_picture',
        'position',
        'notification_read_at',
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
            'must_change_password' => 'boolean',
            'notification_read_at' => 'datetime',
        ];
    }

    public function madaniApplications(): HasMany
    {
        return $this->hasMany(MadaniApplication::class);
    }

    public function latestMadaniApplication(): HasOne
    {
        return $this->hasOne(MadaniApplication::class)->latestOfMany();
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

    public function fcmTokens(): HasMany
    {
        return $this->hasMany(FcmToken::class);
    }

    /**
     * Subscribe a user to a plan.
     *
     * @param  SubscriptionPlan  $plan
     * @param  array  $paymentData  payment_gateway, transaction_id, amount_paid (optional)
     * @param  int  $durationDays  defaults to 365 days for legacy paid flow
     * @param  string  $grantType   payment | early_adopter | madani | admin_grant
     * @param  ?int  $grantedByUserId  Admin user id when grant_type = admin_grant
     */
    public function subscribeToPlan(
        SubscriptionPlan $plan,
        array $paymentData = [],
        int $durationDays = 365,
        string $grantType = 'payment',
        ?int $grantedByUserId = null,
    ): Subscription {
        // Cancel any existing active subscription
        $this->subscriptions()
            ->where('status', Subscription::STATUS_ACTIVE)
            ->update(['status' => Subscription::STATUS_CANCELLED]);

        $subscription = $this->subscriptions()->create([
            'subscription_plan_id' => $plan->id,
            'status' => Subscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => now()->addDays($durationDays),
            'payment_gateway' => $paymentData['payment_gateway'] ?? null,
            'transaction_id' => $paymentData['transaction_id'] ?? null,
            'amount_paid' => $paymentData['amount_paid'] ?? ($grantType === 'payment' ? $plan->price : 0),
            'grant_type' => $grantType,
            'granted_by_user_id' => $grantedByUserId,
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

    /**
     * The user can claim the founding-member RM 99 starter rate if they're
     * currently or were previously an early-adopter grant holder AND they
     * haven't yet purchased Starter Hub at full price.
     */
    public function isFoundingMemberEligible(): bool
    {
        $hadEarlyAdopter = $this->subscriptions()
            ->where('grant_type', 'early_adopter')
            ->exists();

        if (!$hadEarlyAdopter) {
            return false;
        }

        $alreadyPaidStarter = $this->subscriptions()
            ->where('grant_type', 'payment')
            ->whereHas('plan', fn ($q) => $q->where('slug', 'starter-hub'))
            ->exists();

        return !$alreadyPaidStarter;
    }

    public function activeServicesCount(): int
    {
        return $this->services()->where('is_active', true)->count();
    }

    /**
     * Distinct service-category ids the user is currently listing under.
     * Used to enforce SubscriptionPlan::max_categories.
     */
    public function activeCategoryIds(): \Illuminate\Support\Collection
    {
        return $this->services()
            ->where('is_active', true)
            ->pluck('service_category_id')
            ->unique()
            ->values();
    }
}

