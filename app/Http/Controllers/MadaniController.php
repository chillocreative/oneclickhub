<?php

namespace App\Http\Controllers;

use App\Models\MadaniApplication;
use App\Models\SubscriptionPlan;
use App\Services\AdminWhatsappNotifier;
use App\Services\SendoraService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MadaniController extends Controller
{
    /**
     * Customer-facing Madani application form.
     */
    public function create(): Response
    {
        $user = auth()->user();
        $existing = MadaniApplication::where('user_id', $user->id)
            ->latest()
            ->first();

        return Inertia::render('Subscribe/MadaniApplication', [
            'user' => $user->only(['id', 'name', 'phone_number', 'address']),
            'existing' => $existing,
        ]);
    }

    public function store(Request $request, AdminWhatsappNotifier $admin): RedirectResponse
    {
        $user = $request->user();

        $existing = MadaniApplication::where('user_id', $user->id)->latest()->first();
        if ($existing && $existing->isPending()) {
            return back()->with('error', 'You already have a pending Madani application.');
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'ic_number' => 'required|string|max:32',
            'phone_number' => 'required|string|max:20',
            'address' => 'required|string|max:1000',
        ]);

        $validated['full_name'] = mb_strtoupper(trim($validated['full_name']));

        MadaniApplication::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'ic_number' => $validated['ic_number'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'status' => MadaniApplication::STATUS_PENDING,
        ]);

        if (empty($user->address)) {
            $user->address = $validated['address'];
            $user->save();
        }

        $admin->notify(
            "📝 New Madani application\nUser: {$user->name}\nIC: {$validated['ic_number']}\nReview it in the admin dashboard."
        );

        return redirect()->route('madani.create')
            ->with('success', 'Application submitted. We will notify you once it is reviewed.');
    }

    /**
     * Admin: list and review applications.
     */
    public function adminIndex(Request $request): Response
    {
        $query = MadaniApplication::with('user', 'reviewer')->latest();
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Admin/MadaniApplications/Index', [
            'applications' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['status']),
            'stats' => [
                'pending' => MadaniApplication::pending()->count(),
                'approved' => MadaniApplication::where('status', MadaniApplication::STATUS_APPROVED)->count(),
                'rejected' => MadaniApplication::where('status', MadaniApplication::STATUS_REJECTED)->count(),
            ],
        ]);
    }

    public function approve(Request $request, MadaniApplication $application, SendoraService $sendora): RedirectResponse
    {
        if (!$application->isPending()) {
            return back()->with('error', 'This application has already been reviewed.');
        }

        $plan = SubscriptionPlan::where('slug', 'madani')->where('is_active', true)->first();
        if (!$plan) {
            return back()->with('error', 'Madani plan is not configured.');
        }

        $duration = ($plan->interval === 'month') ? 30 : 365;
        $application->user->subscribeToPlan($plan, [], $duration, 'madani', $request->user()->id);

        $application->update([
            'status' => MadaniApplication::STATUS_APPROVED,
            'reviewer_id' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $sendora->sendMessage(
            $application->user->phone_number,
            "✅ Your Madani application is APPROVED!\n\nYour 12-month sponsored subscription on One Click Hub is now active. Open the app to start using it."
        );

        return back()->with('success', 'Application approved. Subscription granted.');
    }

    public function reject(Request $request, MadaniApplication $application, SendoraService $sendora): RedirectResponse
    {
        if (!$application->isPending()) {
            return back()->with('error', 'This application has already been reviewed.');
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

        return back()->with('success', 'Application rejected.');
    }
}
