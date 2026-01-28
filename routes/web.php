<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubscriptionController;
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

        // Revenue Center (Subscriptions)
        Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans'])->name('subscriptions.plans');
        Route::get('/subscriptions/settings', [SubscriptionController::class, 'settings'])->name('subscriptions.settings');
        Route::get('/subscriptions/gateways', [SubscriptionController::class, 'gateways'])->name('subscriptions.gateways');
        Route::patch('/subscriptions/gateways/{gateway}', [SubscriptionController::class, 'updateGateway'])->name('subscriptions.gateways.update');
    });
});

require __DIR__.'/auth.php';
