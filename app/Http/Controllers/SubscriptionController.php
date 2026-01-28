<?php

namespace App\Http\Controllers;

use App\Models\PaymentGateway;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Subscriptions/Index');
    }

    public function plans()
    {
        $plans = SubscriptionPlan::all();
        return Inertia::render('Subscriptions/Plans', [
            'plans' => $plans
        ]);
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
}
