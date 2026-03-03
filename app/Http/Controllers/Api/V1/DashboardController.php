<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Order;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\SsmVerification;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('Admin')) {
            return $this->adminDashboard();
        }

        if ($user->hasRole('Freelancer')) {
            return $this->freelancerDashboard($user);
        }

        return $this->customerDashboard($user);
    }

    private function freelancerDashboard($user): JsonResponse
    {
        $services = Schema::hasTable('services')
            ? Service::where('user_id', $user->id)->latest()->take(5)->get()->load('category')
            : collect();

        $totalServices = Schema::hasTable('services')
            ? Service::where('user_id', $user->id)->count()
            : 0;

        $activeServices = Schema::hasTable('services')
            ? Service::where('user_id', $user->id)->active()->count()
            : 0;

        $subscription = $user->activeSubscription;
        $subscriptionData = null;
        if ($subscription) {
            $subscription->load('plan');
            $subscriptionData = [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'starts_at' => $subscription->starts_at?->toISOString(),
                'ends_at' => $subscription->ends_at?->toISOString(),
                'remaining_days' => $subscription->remaining_days,
                'plan' => $subscription->plan ? [
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price,
                ] : null,
            ];
        }

        $pendingOrders = Order::where('freelancer_id', $user->id)
            ->where('status', Order::STATUS_PENDING_APPROVAL)
            ->count();

        $activeOrders = Order::where('freelancer_id', $user->id)
            ->where('status', Order::STATUS_ACTIVE)
            ->count();

        $totalEarnings = Order::where('freelancer_id', $user->id)
            ->where('status', Order::STATUS_COMPLETED)
            ->sum('agreed_price');

        return $this->success([
            'role' => 'Freelancer',
            'services' => ServiceResource::collection($services),
            'total_services' => $totalServices,
            'active_services' => $activeServices,
            'subscription' => $subscriptionData,
            'pending_orders' => $pendingOrders,
            'active_orders' => $activeOrders,
            'total_earnings' => (float) $totalEarnings,
        ]);
    }

    private function customerDashboard($user): JsonResponse
    {
        $activeBookings = Order::where('customer_id', $user->id)
            ->whereIn('status', [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING_APPROVAL, Order::STATUS_ACTIVE])
            ->count();

        $completedBookings = Order::where('customer_id', $user->id)
            ->where('status', Order::STATUS_COMPLETED)
            ->count();

        $recentBookings = Order::where('customer_id', $user->id)
            ->with(['service', 'freelancer'])
            ->latest()
            ->take(5)
            ->get();

        return $this->success([
            'role' => 'Customer',
            'active_bookings' => $activeBookings,
            'completed_bookings' => $completedBookings,
            'recent_bookings' => $recentBookings,
        ]);
    }

    private function adminDashboard(): JsonResponse
    {
        $stats = [
            'freelancers' => User::role('Freelancer')->count(),
            'customers' => User::role('Customer')->count(),
            'revenue' => Schema::hasTable('transactions')
                ? (float) Transaction::where('status', 'success')->sum('amount')
                : 0,
            'orders' => Schema::hasTable('orders') ? Order::count() : 0,
            'active_subscriptions' => Schema::hasTable('subscriptions')
                ? Subscription::active()->count()
                : 0,
            'pending_ssm' => Schema::hasTable('ssm_verifications')
                ? SsmVerification::where('status', 'pending')->count()
                : 0,
        ];

        $chartData = [];
        if (Schema::hasTable('orders')) {
            $chartData = Order::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as count'),
                    DB::raw('COALESCE(SUM(agreed_price), 0) as revenue')
                )
                ->where('created_at', '>=', now()->subDays(6)->startOfDay())
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => [
                    'name' => \Carbon\Carbon::parse($row->date)->format('D'),
                    'orders' => (int) $row->count,
                    'revenue' => (float) $row->revenue,
                ])
                ->toArray();
        }

        $categoryBreakdown = [];
        if (Schema::hasTable('services') && Schema::hasTable('service_categories')) {
            $categoryBreakdown = ServiceCategory::withCount('services')
                ->having('services_count', '>', 0)
                ->get()
                ->map(fn ($cat) => [
                    'name' => $cat->name,
                    'value' => $cat->services_count,
                ])
                ->toArray();
        }

        $topFreelancers = [];
        if (Schema::hasTable('orders')) {
            $topFreelancers = Order::where('status', Order::STATUS_COMPLETED)
                ->select('freelancer_id', DB::raw('SUM(agreed_price) as total_earnings'))
                ->groupBy('freelancer_id')
                ->orderByDesc('total_earnings')
                ->take(5)
                ->with('freelancer:id,name')
                ->get()
                ->map(function ($row) {
                    $avgRating = Schema::hasTable('reviews')
                        ? Review::where('freelancer_id', $row->freelancer_id)->avg('rating')
                        : null;

                    return [
                        'name' => $row->freelancer->name ?? 'Unknown',
                        'earnings' => (float) $row->total_earnings,
                        'rating' => $avgRating ? round($avgRating, 1) : null,
                    ];
                })
                ->toArray();
        }

        return $this->success([
            'role' => 'Admin',
            'stats' => $stats,
            'chart_data' => $chartData,
            'category_breakdown' => $categoryBreakdown,
            'top_freelancers' => $topFreelancers,
        ]);
    }
}
