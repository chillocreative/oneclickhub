<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function freelancers()
    {
        $subscriptionsTableExists = Schema::hasTable('subscriptions');
        
        $query = User::role('Freelancer');
        
        // Only load subscription relationships if the table exists
        if ($subscriptionsTableExists) {
            $query->with(['activeSubscription.plan']);
        }
        
        $users = $query->get()->map(function ($user) use ($subscriptionsTableExists) {
            $subscription = null;
            
            if ($subscriptionsTableExists && $user->activeSubscription) {
                $subscription = [
                    'id' => $user->activeSubscription->id,
                    'status' => $user->activeSubscription->status,
                    'starts_at' => $user->activeSubscription->starts_at,
                    'ends_at' => $user->activeSubscription->ends_at,
                    'plan' => $user->activeSubscription->plan ? [
                        'id' => $user->activeSubscription->plan->id,
                        'name' => $user->activeSubscription->plan->name,
                        'price' => $user->activeSubscription->plan->price,
                        'interval' => $user->activeSubscription->plan->interval,
                    ] : null,
                ];
            }
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'position' => $user->position,
                'identity_document' => $user->identity_document,
                'created_at' => $user->created_at,
                'subscription' => $subscription,
            ];
        });

        $plans = SubscriptionPlan::where('is_active', true)->get();

        return Inertia::render('Users/Freelancers', [
            'users' => $users,
            'plans' => $plans,
        ]);
    }

    public function customers()
    {
        $users = User::role('Customer')->get();
        return Inertia::render('Users/Customers', [
            'users' => $users
        ]);
    }

    public function admins()
    {
        $users = User::role('Admin')->get();
        return Inertia::render('Users/Admins', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users',
            'email' => 'nullable|email|max:255|unique:users',
            'position' => 'nullable|string|max:255',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone_number' => $request->phone_number,
            'email' => $request->email,
            'position' => $request->position,
            'password' => Hash::make('password'),
        ]);

        $user->assignRole($request->role);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users,phone_number,' . $user->id,
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'position' => 'nullable|string|max:255',
        ]);

        $user->update($request->only('name', 'phone_number', 'email', 'position'));

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Assign a subscription plan to a freelancer
     */
    public function assignSubscription(Request $request, User $user)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $plan = \App\Models\SubscriptionPlan::findOrFail($request->plan_id);
        
        $transactionId = 'MANUAL-' . now()->timestamp . '-' . strtoupper(\Illuminate\Support\Str::random(4));

        $user->subscribeToPlan($plan, [
            'payment_gateway' => 'manual',
            'transaction_id' => $transactionId,
            'amount_paid' => $plan->price,
        ]);

        // Record the transaction
        \App\Models\Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'transaction_id' => $transactionId,
            'order_number' => 'ORD-' . now()->format('YmdHis') . $user->id,
            'amount' => $plan->price,
            'currency' => 'MYR',
            'gateway' => 'manual',
            'status' => 'success',
            'payment_method' => 'manual',
        ]);

        return back()->with('success', "Subscription assigned to {$user->name} successfully.");
    }

    /**
     * Cancel a user's subscription
     */
    public function cancelSubscription(User $user)
    {
        $subscription = $user->activeSubscription;
        
        if (!$subscription) {
            return back()->with('error', 'No active subscription found.');
        }

        $subscription->update(['status' => 'cancelled']);

        return back()->with('success', "Subscription cancelled for {$user->name}.");
    }
}

