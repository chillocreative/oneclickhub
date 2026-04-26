<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\FcmTokenController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
*/

// Auth (Guest)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Auth (Authenticated)
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

// Public: Services & Categories
Route::get('/services', [ServiceController::class, 'browse']);
Route::get('/services/{service:slug}', [ServiceController::class, 'show']);
Route::get('/categories', [ServiceController::class, 'categories']);

// Public: Advertisements
Route::get('/advertisements', [ServiceController::class, 'advertisements']);

// Public: Halal Restaurants
Route::get('/halal-restaurants', [ServiceController::class, 'halalRestaurants']);

// Public: Guest Notifications
Route::get('/notifications/guest', [SettingsController::class, 'guestNotifications']);

// Public: Subscription Plans
Route::get('/plans', [SubscriptionController::class, 'plans']);

// Public: Guest FCM Token
Route::post('/fcm-token/guest', [FcmTokenController::class, 'storeGuest']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // My Services (Freelancer)
    Route::get('/my-services', [ServiceController::class, 'index']);
    Route::post('/my-services', [ServiceController::class, 'store']);
    Route::get('/my-services/{service}', [ServiceController::class, 'edit']);
    Route::post('/my-services/{service}', [ServiceController::class, 'update']); // POST for multipart
    Route::delete('/my-services/{service}', [ServiceController::class, 'destroy']);

    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders/{order}/upload-slip', [OrderController::class, 'uploadSlip']);
    Route::post('/orders/{order}/accept', [OrderController::class, 'accept']);
    Route::post('/orders/{order}/reject', [OrderController::class, 'reject']);
    Route::post('/orders/{order}/deliver', [OrderController::class, 'deliver']);
    Route::post('/orders/{order}/complete', [OrderController::class, 'complete']);
    Route::get('/my-orders', [OrderController::class, 'freelancerOrders']);
    Route::get('/my-bookings', [OrderController::class, 'customerOrders']);

    // Chat
    Route::get('/chat', [ChatController::class, 'index']);
    Route::post('/chat/start', [ChatController::class, 'startConversation']);
    Route::get('/chat/{conversation}', [ChatController::class, 'show']);
    Route::post('/chat/{conversation}/send', [ChatController::class, 'sendMessage']);
    Route::get('/chat/{conversation}/poll', [ChatController::class, 'poll']);
    Route::delete('/chat/{conversation}', [ChatController::class, 'destroy']);

    // Subscriptions & Payments
    Route::post('/subscribe/pay/{plan:slug}', [SubscriptionController::class, 'initiatePayment']);
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel']);

    // Calendar (Freelancer)
    Route::get('/calendar', [CalendarController::class, 'index']);
    Route::post('/calendar', [CalendarController::class, 'update']);
    Route::delete('/calendar/date', [CalendarController::class, 'removeDate']);

    // Settings / Profile
    Route::get('/settings/banking', [SettingsController::class, 'bankingDetail']);
    Route::patch('/settings/banking', [SettingsController::class, 'updateBanking']);
    Route::get('/settings/ssm', [SettingsController::class, 'ssmCertificate']);
    Route::post('/settings/ssm-upload', [SettingsController::class, 'uploadSsm']);
    Route::get('/profile', [SettingsController::class, 'profile']);
    Route::post('/profile', [SettingsController::class, 'updateProfile']);
    Route::patch('/profile', [SettingsController::class, 'updateProfile']);

    // FCM Tokens
    Route::post('/fcm-token', [FcmTokenController::class, 'store']);
    Route::delete('/fcm-token', [FcmTokenController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [SettingsController::class, 'notifications']);
    Route::post('/notifications/mark-read', [SettingsController::class, 'markNotificationsRead']);

    // Admin Routes
    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        // Users
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{user}', [AdminController::class, 'showUser']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::patch('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);

        // Orders
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::get('/orders/{order}', [AdminController::class, 'showOrder']);
        Route::patch('/orders/{order}', [AdminController::class, 'updateOrder']);
        Route::delete('/orders/{order}', [AdminController::class, 'destroyOrder']);

        // Categories
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::post('/categories', [AdminController::class, 'storeCategory']);
        Route::patch('/categories/{category}', [AdminController::class, 'updateCategory']);
        Route::delete('/categories/{category}', [AdminController::class, 'destroyCategory']);

        // SSM Verifications
        Route::get('/ssm-verifications', [AdminController::class, 'ssmVerifications']);
        Route::patch('/ssm-verifications/{ssm}', [AdminController::class, 'updateSsmVerification']);

        // Transactions
        Route::get('/transactions', [AdminController::class, 'transactions']);

        // Subscription Plans
        Route::get('/plans', [AdminController::class, 'plansList']);
        Route::post('/plans', [AdminController::class, 'storePlan']);
        Route::patch('/plans/{plan}', [AdminController::class, 'updatePlan']);
        Route::delete('/plans/{plan}', [AdminController::class, 'destroyPlan']);

        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Settings
        Route::get('/settings', [AdminController::class, 'settings']);
        Route::patch('/settings', [AdminController::class, 'updateSettings']);
    });
});
