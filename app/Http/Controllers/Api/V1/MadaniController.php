<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MadaniApplication;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\AdminWhatsappNotifier;
use App\Services\SendoraService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MadaniController extends Controller
{
    use ApiResponse;

    /**
     * Customer submits an application to subscribe under the Madani sponsored
     * plan. Creates a row in `madani_applications` (status=pending) and
     * pings admins via WhatsApp so they can review.
     */
    public function store(Request $request, AdminWhatsappNotifier $admin): JsonResponse
    {
        $user = $request->user();

        $existing = MadaniApplication::where('user_id', $user->id)->latest()->first();
        if ($existing && $existing->isPending()) {
            return $this->error('You already have a pending Madani application.', 422);
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'ic_number' => 'required|string|max:32',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:1000',
        ]);

        $validated['full_name'] = mb_strtoupper(trim($validated['full_name']));

        $application = MadaniApplication::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'ic_number' => $validated['ic_number'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'status' => MadaniApplication::STATUS_PENDING,
        ]);

        // Mirror the address onto the user record for convenience.
        if (empty($user->address)) {
            $user->address = $validated['address'];
            $user->save();
        }

        $admin->notify(
            "📝 New Madani application\nUser: {$user->name}\nIC: {$validated['ic_number']}\nReview it in the admin dashboard."
        );

        return $this->success($application, 'Application submitted. We will notify you once it is reviewed.', 201);
    }

    /**
     * Get the current user's latest Madani application (any status).
     */
    public function mine(Request $request): JsonResponse
    {
        $application = MadaniApplication::where('user_id', $request->user()->id)
            ->latest()
            ->first();

        return $this->success($application);
    }

    /**
     * Admin: list applications.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MadaniApplication::with('user', 'reviewer')->latest();
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return $this->paginated($query->paginate($request->input('per_page', 15)));
    }

    /**
     * Admin approves an application — grants the Madani subscription.
     */
    public function approve(Request $request, MadaniApplication $application, SendoraService $sendora): JsonResponse
    {
        if (!$application->isPending()) {
            return $this->error('This application has already been reviewed.', 422);
        }

        $plan = SubscriptionPlan::where('slug', 'madani')->where('is_active', true)->first();
        if (!$plan) {
            return $this->error('Madani plan is not configured.', 500);
        }

        $user = $application->user;
        $duration = ($plan->interval === 'month') ? 30 : 365;
        $user->subscribeToPlan($plan, [], $duration, 'madani', $request->user()->id);

        $application->update([
            'status' => MadaniApplication::STATUS_APPROVED,
            'reviewer_id' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $sendora->sendMessage(
            $user->phone_number,
            "✅ Your Madani application is APPROVED!\n\nYour 12-month sponsored subscription on One Click Hub is now active. Open the app to start using it."
        );

        return $this->success($application->fresh()->load('user', 'reviewer'), 'Application approved.');
    }

    /**
     * Admin rejects an application with an optional reason.
     */
    public function reject(Request $request, MadaniApplication $application, SendoraService $sendora): JsonResponse
    {
        if (!$application->isPending()) {
            return $this->error('This application has already been reviewed.', 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $application->update([
            'status' => MadaniApplication::STATUS_REJECTED,
            'reviewer_id' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $request->notes,
        ]);

        $reason = $request->notes ? "\nReason: {$request->notes}" : '';
        $sendora->sendMessage(
            $application->user->phone_number,
            "❌ Your Madani application was not approved.{$reason}\n\nYou can subscribe to one of our other plans inside the app."
        );

        return $this->success($application->fresh()->load('user', 'reviewer'), 'Application rejected.');
    }
}
