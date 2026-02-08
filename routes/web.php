<?php

use App\Http\Controllers\BankingDetailController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SsmVerificationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserController;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'plans' => SubscriptionPlan::where('is_active', true)->get(),
    ]);
});

// Public service browsing
Route::get('/services', [ServiceController::class, 'browse'])->name('services.browse');
Route::get('/services/{service:slug}', [ServiceController::class, 'show'])->name('services.show');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

// Payment Routes (public - no auth required for callbacks)
Route::prefix('payment')->name('payment.')->group(function () {
    Route::post('/bayarcash/callback', [PaymentController::class, 'bayarcashCallback'])->name('bayarcash.callback');
    Route::get('/bayarcash/return', [PaymentController::class, 'bayarcashReturn'])->name('bayarcash.return');
    Route::match(['get', 'post'], '/senangpay/callback', [PaymentController::class, 'senangpayCallback'])->name('senangpay.callback');
    Route::get('/success', [PaymentController::class, 'success'])->name('success');
    Route::get('/failed', [PaymentController::class, 'failed'])->name('failed');
    Route::get('/pending', [PaymentController::class, 'pending'])->name('pending');
});

Route::middleware('auth')->group(function () {
    // Subscription checkout routes (for Freelancers)
    Route::prefix('subscribe')->name('subscribe.')->group(function () {
        Route::get('/', [PaymentController::class, 'selectPlan'])->name('plans');
        Route::get('/checkout/{plan:slug}', [PaymentController::class, 'checkout'])->name('checkout');
        Route::post('/pay/{plan:slug}', [PaymentController::class, 'initiatePayment'])->name('pay');
    });

    // Freelancer subscription cancel
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancelSelf'])->name('subscription.cancel');

    // Freelancer service management
    Route::prefix('my-services')->name('my-services.')->group(function () {
        Route::get('/', [ServiceController::class, 'index'])->name('index');
        Route::get('/create', [ServiceController::class, 'create'])->name('create');
        Route::post('/', [ServiceController::class, 'store'])->name('store');
        Route::get('/{service}/edit', [ServiceController::class, 'edit'])->name('edit');
        Route::patch('/{service}', [ServiceController::class, 'update'])->name('update');
        Route::delete('/{service}', [ServiceController::class, 'destroy'])->name('destroy');
    });

    // Banking details
    Route::get('/settings/banking', [BankingDetailController::class, 'edit'])->name('settings.banking');
    Route::patch('/settings/banking', [BankingDetailController::class, 'update'])->name('settings.banking.update');

    // Calendar management
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('/calendar', [CalendarController::class, 'update'])->name('calendar.update');
    Route::delete('/calendar/date', [CalendarController::class, 'removeDate'])->name('calendar.removeDate');

    // Orders
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/upload-slip', [OrderController::class, 'uploadSlip'])->name('orders.uploadSlip');
    Route::post('/orders/{order}/accept', [OrderController::class, 'accept'])->name('orders.accept');
    Route::post('/orders/{order}/reject', [OrderController::class, 'reject'])->name('orders.reject');
    Route::post('/orders/{order}/deliver', [OrderController::class, 'deliver'])->name('orders.deliver');
    Route::post('/orders/{order}/complete', [OrderController::class, 'complete'])->name('orders.complete');
    Route::get('/my-orders', [OrderController::class, 'freelancerOrders'])->name('orders.freelancer');
    Route::get('/my-bookings', [OrderController::class, 'customerOrders'])->name('orders.customer');

    // Chat
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat/start', [ChatController::class, 'startConversation'])->name('chat.start');
    Route::get('/chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage'])->name('chat.send');
    Route::get('/chat/{conversation}/poll', [ChatController::class, 'poll'])->name('chat.poll');

    // SSM verification
    Route::post('/settings/ssm-upload', [SsmVerificationController::class, 'upload'])->name('settings.ssm.upload');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notifications
    Route::post('/notifications/mark-read', function () {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    })->name('notifications.markRead');

    Route::middleware('role:Admin')->group(function () {
        Route::get('/users/freelancers', [UserController::class, 'freelancers'])->name('users.freelancers');
        Route::get('/users/customers', [UserController::class, 'customers'])->name('users.customers');
        Route::get('/users/admins', [UserController::class, 'admins'])->name('users.admins');

        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/subscription', [UserController::class, 'assignSubscription'])->name('users.subscription.assign');
        Route::delete('/users/{user}/subscription', [UserController::class, 'cancelSubscription'])->name('users.subscription.cancel');

        Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans'])->name('subscriptions.plans');
        Route::post('/subscriptions/plans', [SubscriptionController::class, 'storePlan'])->name('subscriptions.plans.store');
        Route::patch('/subscriptions/plans/{plan}', [SubscriptionController::class, 'updatePlan'])->name('subscriptions.plans.update');
        Route::delete('/subscriptions/plans/{plan}', [SubscriptionController::class, 'destroyPlan'])->name('subscriptions.plans.destroy');
        Route::patch('/subscriptions/plans/{plan}/toggle', [SubscriptionController::class, 'togglePlanStatus'])->name('subscriptions.plans.toggle');
        Route::get('/subscriptions/settings', [SubscriptionController::class, 'settings'])->name('subscriptions.settings');
        Route::get('/subscriptions/gateways', [SubscriptionController::class, 'gateways'])->name('subscriptions.gateways');
        Route::patch('/subscriptions/gateways/{gateway}', [SubscriptionController::class, 'updateGateway'])->name('subscriptions.gateways.update');
        Route::get('/subscriptions/transactions', [SubscriptionController::class, 'transactions'])->name('subscriptions.transactions');

        Route::get('/subscriptions/transactions/{transaction}', [SubscriptionController::class, 'transactionShow'])->name('subscriptions.transactions.show');
        Route::patch('/subscriptions/transactions/{transaction}', [SubscriptionController::class, 'transactionUpdate'])->name('subscriptions.transactions.update');
        Route::delete('/subscriptions/transactions/{transaction}', [SubscriptionController::class, 'transactionDestroy'])->name('subscriptions.transactions.destroy');

        // Admin orders
        Route::get('/admin/orders', [OrderController::class, 'adminIndex'])->name('admin.orders.index');
        Route::get('/admin/orders/{order}', [OrderController::class, 'adminShow'])->name('admin.orders.show');
        Route::patch('/admin/orders/{order}', [OrderController::class, 'adminUpdate'])->name('admin.orders.update');
        Route::delete('/admin/orders/{order}', [OrderController::class, 'adminDestroy'])->name('admin.orders.destroy');

        // Admin categories
        Route::get('/admin/categories', [ServiceCategoryController::class, 'index'])->name('admin.categories.index');
        Route::post('/admin/categories', [ServiceCategoryController::class, 'store'])->name('admin.categories.store');
        Route::patch('/admin/categories/{category}', [ServiceCategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/admin/categories/{category}', [ServiceCategoryController::class, 'destroy'])->name('admin.categories.destroy');

        // Admin SSM verifications
        Route::get('/admin/ssm-verifications', [SsmVerificationController::class, 'index'])->name('admin.ssm.index');
        Route::post('/admin/ssm-verifications/{verification}/verify', [SsmVerificationController::class, 'manualVerify'])->name('admin.ssm.verify');
        Route::delete('/admin/ssm-verifications/{verification}', [SsmVerificationController::class, 'destroy'])->name('admin.ssm.destroy');

        // Admin settings
        Route::get('/admin/settings', [SsmVerificationController::class, 'adminSettings'])->name('admin.settings');
        Route::patch('/admin/settings', [SsmVerificationController::class, 'updateSettings'])->name('admin.settings.update');
    });
});

require __DIR__.'/auth.php';
