<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\PaymentController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Payment Routes (public - no auth required for callbacks)
Route::prefix('payment')->name('payment.')->group(function () {
    // Bayarcash callbacks
    Route::get('/bayarcash/return', [PaymentController::class, 'bayarcashReturn'])->name('bayarcash.return');
    
    // SenangPay callback (can be GET or POST)
    Route::match(['get', 'post'], '/senangpay/callback', [PaymentController::class, 'senangpayCallback'])->name('senangpay.callback');
    
    // Payment status pages
    Route::get('/success', [PaymentController::class, 'success'])->name('success');
    Route::get('/failed', [PaymentController::class, 'failed'])->name('failed');
    Route::get('/pending', [PaymentController::class, 'pending'])->name('pending');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::middleware('role:Admin')->group(function () {
        Route::get('/users/freelancers', [UserController::class, 'freelancers'])->name('users.freelancers');
        Route::get('/users/customers', [UserController::class, 'customers'])->name('users.customers');
        Route::get('/users/admins', [UserController::class, 'admins'])->name('users.admins');
        
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/subscription', [UserController::class, 'assignSubscription'])->name('users.subscription.assign');
        Route::delete('/users/{user}/subscription', [UserController::class, 'cancelSubscription'])->name('users.subscription.cancel');

        // Revenue Center (Subscriptions)
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
    });
});

require __DIR__.'/auth.php';

