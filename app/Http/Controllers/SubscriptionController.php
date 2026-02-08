<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Subscriptions/Index');
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

