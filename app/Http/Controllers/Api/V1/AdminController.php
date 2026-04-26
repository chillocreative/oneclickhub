<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\OrderResource;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Http\Resources\V1\SsmVerificationResource;
use App\Http\Resources\V1\SubscriptionPlanResource;
use App\Http\Resources\V1\TransactionResource;
use App\Http\Resources\V1\UserResource;
use App\Models\AdminSetting;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\SsmVerification;
use App\Models\SubscriptionPlan;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    use ApiResponse;

    // ── Users ────────────────────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($request->filled('role')) {
            $query->role($request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($request->input('per_page', 15));

        return $this->paginated($users);
    }

    public function showUser(User $user): JsonResponse
    {
        $user->load(['roles', 'activeSubscription.plan', 'ssmVerification', 'bankingDetail']);

        return $this->success(new UserResource($user));
    }

    public function storeUser(Request $request): JsonResponse
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

        return $this->success(new UserResource($user->load('roles')), 'User created successfully.', 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users,phone_number,' . $user->id,
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'position' => 'nullable|string|max:255',
        ]);

        $user->update($request->only('name', 'phone_number', 'email', 'position'));

        return $this->success(new UserResource($user->load('roles')), 'User updated successfully.');
    }

    public function destroyUser(User $user): JsonResponse
    {
        $user->delete();

        return $this->success(null, 'User deleted successfully.');
    }

    // ── Orders ───────────────────────────────────────────

    public function orders(Request $request): JsonResponse
    {
        $query = Order::with(['customer', 'freelancer', 'service'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('freelancer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        $stats = [
            'total' => Order::count(),
            'pending' => Order::whereIn('status', [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING_APPROVAL])->count(),
            'active' => Order::where('status', Order::STATUS_ACTIVE)->count(),
            'completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
            'cancelled' => Order::whereIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])->count(),
        ];

        $orders = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'stats' => $stats,
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function showOrder(Order $order): JsonResponse
    {
        $order->load(['customer', 'freelancer', 'freelancer.bankingDetail', 'service', 'review', 'conversation.messages.sender']);

        return $this->success(new OrderResource($order));
    }

    public function updateOrder(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending_payment,pending_approval,active,delivered,completed,cancelled,rejected',
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === Order::STATUS_CANCELLED) {
            $data['cancelled_at'] = now();
            $data['cancellation_reason'] = $validated['cancellation_reason'] ?? 'Cancelled by admin';
        } elseif ($validated['status'] === Order::STATUS_COMPLETED) {
            $data['completed_at'] = now();
        } elseif ($validated['status'] === Order::STATUS_DELIVERED) {
            $data['delivered_at'] = now();
        } elseif ($validated['status'] === Order::STATUS_ACTIVE) {
            $data['freelancer_responded_at'] = now();
        }

        $order->update($data);

        return $this->success(new OrderResource($order->fresh()->load(['customer', 'freelancer', 'service'])), 'Order status updated.');
    }

    public function destroyOrder(Order $order): JsonResponse
    {
        if ($order->payment_slip) {
            Storage::disk('public')->delete($order->payment_slip);
        }

        $order->delete();

        return $this->success(null, 'Order deleted.');
    }

    // ── Categories ───────────────────────────────────────

    public function categories(): JsonResponse
    {
        $categories = ServiceCategory::withCount('services')->orderBy('name')->get();

        return $this->success(ServiceCategoryResource::collection($categories));
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category = ServiceCategory::create($data);

        return $this->success(new ServiceCategoryResource($category), 'Category created.', 201);
    }

    public function updateCategory(Request $request, ServiceCategory $category): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ];

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        return $this->success(new ServiceCategoryResource($category), 'Category updated.');
    }

    public function destroyCategory(ServiceCategory $category): JsonResponse
    {
        if ($category->services()->count() > 0) {
            return $this->error('Cannot delete a category that has services.', 422);
        }

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return $this->success(null, 'Category deleted.');
    }

    // ── SSM Verifications ────────────────────────────────

    public function ssmVerifications(Request $request): JsonResponse
    {
        $query = SsmVerification::with('user')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('registration_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $stats = [
            'total' => SsmVerification::count(),
            'pending' => SsmVerification::where('status', 'pending')->count(),
            'verified' => SsmVerification::where('status', 'verified')->count(),
            'failed' => SsmVerification::where('status', 'failed')->count(),
        ];

        $verifications = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $verifications->items(),
            'stats' => $stats,
            'meta' => [
                'current_page' => $verifications->currentPage(),
                'last_page' => $verifications->lastPage(),
                'per_page' => $verifications->perPage(),
                'total' => $verifications->total(),
            ],
        ]);
    }

    public function updateSsmVerification(Request $request, SsmVerification $ssm): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:verified,failed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $updateData = [
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ];

        if ($request->status === 'verified') {
            $updateData['grace_period_ends_at'] = null;
            $updateData['services_hidden_at'] = null;
        }

        $ssm->update($updateData);

        if ($request->status === 'verified') {
            Service::where('user_id', $ssm->user_id)->update(['is_active' => true]);
        }

        return $this->success(null, 'Verification updated.');
    }

    // ── Transactions ─────────────────────────────────────

    public function transactions(Request $request): JsonResponse
    {
        $query = Transaction::with(['user', 'plan'])->latest();

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

        $transactions = $query->paginate($request->input('per_page', 15));

        return $this->paginated($transactions);
    }

    // ── Subscription Plans ───────────────────────────────

    public function plansList(): JsonResponse
    {
        $plans = Schema::hasTable('subscriptions')
            ? SubscriptionPlan::withCount(['subscriptions' => fn($q) => $q->where('status', 'active')])->get()
            : SubscriptionPlan::all();

        return $this->success(SubscriptionPlanResource::collection($plans));
    }

    public function storePlan(Request $request): JsonResponse
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

        if ($request->is_popular) {
            SubscriptionPlan::where('is_popular', true)->update(['is_popular' => false]);
        }

        $plan = SubscriptionPlan::create($validated);

        return $this->success(new SubscriptionPlanResource($plan), 'Plan created.', 201);
    }

    public function updatePlan(Request $request, SubscriptionPlan $plan): JsonResponse
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

        if ($request->is_popular && !$plan->is_popular) {
            SubscriptionPlan::where('is_popular', true)->update(['is_popular' => false]);
        }

        $plan->update($validated);

        return $this->success(new SubscriptionPlanResource($plan), 'Plan updated.');
    }

    public function destroyPlan(SubscriptionPlan $plan): JsonResponse
    {
        if (Schema::hasTable('subscriptions')) {
            $activeSubscribers = $plan->subscriptions()->where('status', 'active')->count();
            if ($activeSubscribers > 0) {
                return $this->error("Cannot delete plan with {$activeSubscribers} active subscriber(s).", 422);
            }
        }

        $plan->delete();

        return $this->success(null, 'Plan deleted.');
    }

    // ── Dashboard ────────────────────────────────────────

    public function dashboard(): JsonResponse
    {
        // Redirect to main dashboard controller
        return app(DashboardController::class)->index(request());
    }

    // ── Settings ─────────────────────────────────────────

    public function settings(): JsonResponse
    {
        return $this->success([
            'openai_api_key' => AdminSetting::get('openai_api_key') ? '••••••••' : '',
            'claude_api_key' => AdminSetting::get('claude_api_key') ? '••••••••' : '',
            'active_ai_provider' => AdminSetting::get('active_ai_provider', 'openai'),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'openai_api_key' => 'nullable|string|max:255',
            'claude_api_key' => 'nullable|string|max:255',
            'active_ai_provider' => 'required|in:openai,claude',
        ]);

        if ($request->openai_api_key && $request->openai_api_key !== '••••••••') {
            AdminSetting::set('openai_api_key', $request->openai_api_key);
        }

        if ($request->claude_api_key && $request->claude_api_key !== '••••••••') {
            AdminSetting::set('claude_api_key', $request->claude_api_key);
        }

        AdminSetting::set('active_ai_provider', $request->active_ai_provider);

        return $this->success(null, 'Settings updated.');
    }
}
