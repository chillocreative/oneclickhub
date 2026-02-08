<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\SsmVerification;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->hasRole('Admin')) {
            return $this->adminDashboard();
        }

        if ($user->hasRole('Freelancer')) {
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
                $subscriptionData = $subscription->toArray();
                $subscriptionData['remaining_days'] = $subscription->remaining_days;
            }

            return Inertia::render('Dashboard/Freelancer', [
                'services' => $services,
                'totalServices' => $totalServices,
                'activeServices' => $activeServices,
                'subscription' => $subscriptionData,
            ]);
        }

        // Customer
        return Inertia::render('Dashboard/Customer');
    }

    private function adminDashboard()
    {
        // Stats cards
        $stats = [
            'freelancers' => User::role('Freelancer')->count(),
            'customers' => User::role('Customer')->count(),
            'revenue' => Schema::hasTable('transactions')
                ? (float) Transaction::where('status', 'success')->sum('amount')
                : 0,
            'orders' => Schema::hasTable('orders') ? Order::count() : 0,
            'activeSubscriptions' => Schema::hasTable('subscriptions')
                ? Subscription::active()->count()
                : 0,
            'pendingSsm' => Schema::hasTable('ssm_verifications')
                ? SsmVerification::where('status', 'pending')->count()
                : 0,
        ];

        // Order analytics - last 7 days
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

        // Category breakdown (services per category)
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

        // Top 5 freelancers by completed order earnings
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

                    $name = $row->freelancer->name ?? 'Unknown';
                    $initials = collect(explode(' ', $name))
                        ->map(fn ($w) => strtoupper(mb_substr($w, 0, 1)))
                        ->take(2)
                        ->join('');

                    return [
                        'name' => $name,
                        'earnings' => (float) $row->total_earnings,
                        'rating' => $avgRating ? round($avgRating, 1) : null,
                        'initials' => $initials,
                    ];
                })
                ->toArray();
        }

        // Top order categories
        $topCategories = [];
        if (Schema::hasTable('orders') && Schema::hasTable('services') && Schema::hasTable('service_categories')) {
            $topCategories = Order::join('services', 'orders.service_id', '=', 'services.id')
                ->join('service_categories', 'services.service_category_id', '=', 'service_categories.id')
                ->select('service_categories.name', DB::raw('COUNT(orders.id) as order_count'))
                ->groupBy('service_categories.id', 'service_categories.name')
                ->orderByDesc('order_count')
                ->take(4)
                ->get()
                ->toArray();
        }

        return Inertia::render('Dashboard/Admin', [
            'stats' => $stats,
            'chartData' => $chartData,
            'categoryBreakdown' => $categoryBreakdown,
            'topFreelancers' => $topFreelancers,
            'topCategories' => $topCategories,
        ]);
    }
}
