<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/categories', function () {
    return \App\Models\ServiceCategory::all();
});

// Payment Gateway Callbacks (server-to-server, no CSRF)
Route::post('/payment/bayarcash/callback', [PaymentController::class, 'bayarcashCallback'])
    ->name('api.payment.bayarcash.callback');

