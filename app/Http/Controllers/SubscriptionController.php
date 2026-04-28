<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Subscriptions/Index', [
            'stats' => $this->overviewStats(),
            'recentSubscribers' => $this->recentSubscribers(),
        ]);
    }

    /**
     * Live KPIs for the Revenue Overview cards.
     *
     * Each metric is paired with a month-over-month delta so the
     * green pill on each card tracks the real trend instead of the
     * mock "+12%" / "+8.4%" / "+2.1%" placeholders.
     */
    private function overviewStats(): array
    {
        $hasSubs = Schema::hasTable('subscriptions');
        $hasTx = Schema::hasTable('transactions');
        $hasUsers = Schema::hasTable('users');

        $now = now();
        $startThis = $now->copy()->startOfMonth();
        $startLast = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $endLast = $startThis->copy()->subSecond();

        // Active subscribers — distinct users with a still-running subscription
        $activeNow = $hasSubs
            ? Subscription::active()->distinct('user_id')->count('user_id')
            : 0;
        $activeLast = $hasSubs
            ? Subscription::whereIn('status', [Subscription::STATUS_ACTIVE, Subscription::STATUS_CANCELLED])
                ->where('starts_at', '<=', $endLast)
                ->where(function ($q) use ($endLast) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>', $endLast);
                })
                ->distinct('user_id')->count('user_id')
            : 0;

        // Monthly revenue — sum of successful transactions in the current calendar month
        $revenueThis = $hasTx
            ? (float) Transaction::where('status', Transaction::STATUS_SUCCESS)
                ->where('created_at', '>=', $startThis)
                ->sum('amount')
            : 0.0;
        $revenueLast = $hasTx
            ? (float) Transaction::where('status', Transaction::STATUS_SUCCESS)
                ->whereBetween('created_at', [$startLast, $endLast])
                ->sum('amount')
            : 0.0;

        // Subscription rate — share of users currently subscribed
        $totalUsers = $hasUsers ? User::count() : 0;
        $rateNow = $totalUsers > 0 ? round(($activeNow / $totalUsers) * 100, 1) : 0.0;
        $rateLast = $totalUsers > 0 ? round(($activeLast / $totalUsers) * 100, 1) : 0.0;

        return [
            'activeSubscribers' => [
                'value' => $activeNow,
                'delta' => $this->percentDelta($activeNow, $activeLast),
            ],
            'monthlyRevenue' => [
                'value' => $revenueThis,
                'delta' => $this->percentDelta($revenueThis, $revenueLast),
            ],
            'subscriptionRate' => [
                'value' => $rateNow,
                'delta' => $this->percentDelta($rateNow, $rateLast),
            ],
        ];
    }

    /**
     * Latest paid sign-ups for the "Recent Subscribers" list.
     *
     * Times are pre-formatted with diffForHumans so the React page
     * doesn't need a date library, and amount falls back to the
     * plan price when the subscription was granted manually.
     */
    private function recentSubscribers(int $limit = 4): array
    {
        if (! Schema::hasTable('subscriptions')) {
            return [];
        }

        return Subscription::with(['user:id,name', 'plan:id,name,price'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function (Subscription $sub) {
                $amount = $sub->amount_paid ?? optional($sub->plan)->price ?? 0;
                return [
                    'id' => $sub->id,
                    'name' => optional($sub->user)->name ?? 'Unknown',
                    'plan' => optional($sub->plan)->name ?? 'Unknown plan',
                    'date' => optional($sub->created_at)->diffForHumans() ?? '',
                    'amount' => 'RM ' . number_format((float) $amount, 0),
                ];
            })
            ->values()
            ->all();
    }

    private function percentDelta(float $current, float $previous): string
    {
        if ($previous <= 0) {
            return $current > 0 ? '+100%' : '+0%';
        }

        $delta = round((($current - $previous) / $previous) * 100, 1);
        $prefix = $delta >= 0 ? '+' : '';
        return $prefix . $delta . '%';
    }

    public function plans()
    {
        // Check if subscriptions table exists before using withCount
        if (Schema::hasTable('subscriptions')) {
            $plans = SubscriptionPlan::withCount(['subscriptions' => function ($query) {
                $query->where('status', 'active');
            }])->get();
        } else {
            $plans = SubscriptionPlan::all()->map(function ($plan) {
                $plan->subscriptions_count = 0;
                return $plan;
            });
        }
        
        return Inertia::render('Subscriptions/Plans', [
            'plans' => $plans
        ]);
    }

    public function storePlan(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'interval' => 'required|string|in:year',
            'features' => 'required|array|min:1',
            'features.*' => 'required|string|max:255',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Ensure only one plan is popular
        if ($request->is_popular) {
            SubscriptionPlan::where('is_popular', true)->update(['is_popular' => false]);
        }

        SubscriptionPlan::create($validated);

        return back()->with('success', 'Plan created successfully.');
    }

    public function updatePlan(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'interval' => 'required|string|in:year',
            'features' => 'required|array|min:1',
            'features.*' => 'required|string|max:255',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        // Ensure only one plan is popular
        if ($request->is_popular && !$plan->is_popular) {
            SubscriptionPlan::where('is_popular', true)->update(['is_popular' => false]);
        }

        $plan->update($validated);

        return back()->with('success', 'Plan updated successfully.');
    }

    public function destroyPlan(SubscriptionPlan $plan)
    {
        // Check if plan has active subscribers (only if table exists)
        if (Schema::hasTable('subscriptions')) {
            $activeSubscribers = $plan->subscriptions()->where('status', 'active')->count();
            
            if ($activeSubscribers > 0) {
                return back()->with('error', "Cannot delete plan with {$activeSubscribers} active subscriber(s). Please cancel their subscriptions first.");
            }
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted successfully.');
    }

    public function togglePlanStatus(SubscriptionPlan $plan)
    {
        $plan->update(['is_active' => !$plan->is_active]);

        $status = $plan->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Plan {$status} successfully.");
    }

    public function cancelSelf()
    {
        $user = auth()->user();
        $subscription = $user->activeSubscription;

        if (!$subscription || $subscription->status !== \App\Models\Subscription::STATUS_ACTIVE) {
            return back()->with('error', 'No active subscription to cancel.');
        }

        $subscription->update(['status' => \App\Models\Subscription::STATUS_CANCELLED]);

        $remainingDays = $subscription->remaining_days;

        return back()->with('success', "Subscription cancelled. You can still use your plan for {$remainingDays} more days until " . $subscription->ends_at->format('d M Y') . ".");
    }

    public function settings()
    {
        return Inertia::render('Subscriptions/Settings');
    }

    public function gateways()
    {
        $gateways = PaymentGateway::all();
        return Inertia::render('Subscriptions/Gateways', [
            'gateways' => $gateways
        ]);
    }

    public function updateGateway(Request $request, PaymentGateway $gateway)
    {
        $request->validate([
            'is_active' => 'required|boolean',
            'mode' => 'required|string|in:sandbox,live',
            'settings' => 'required|array',
        ]);

        $gateway->update($request->only('is_active', 'mode', 'settings'));

        return back()->with('success', $gateway->name . ' configuration saved successfully.');
    }

    public function transactions(Request $request)
    {
        $query = \App\Models\Transaction::with(['user', 'plan'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->gateway);
        }

        $transactions = $query->paginate(15)->withQueryString();

        return Inertia::render('Subscriptions/Transactions', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'gateway']),
        ]);
    }

    public function transactionShow(\App\Models\Transaction $transaction)
    {
        $transaction->load(['user', 'plan']);

        return Inertia::render('Subscriptions/TransactionShow', [
            'transaction' => $transaction,
        ]);
    }

    public function transactionUpdate(Request $request, \App\Models\Transaction $transaction)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:success,failed,pending,cancelled',
        ]);

        $transaction->update($validated);

        return back()->with('success', 'Transaction status updated.');
    }

    public function transactionDestroy(\App\Models\Transaction $transaction)
    {
        $transaction->delete();

        return redirect()->route('subscriptions.transactions')->with('success', 'Transaction deleted.');
    }
}

