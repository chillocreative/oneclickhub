<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'planSlug' => $request->query('plan'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|digits_between:10,11|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|string|in:Freelancer,Customer',
            'identity_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'plan' => 'nullable|string|max:255',
        ]);

        $identityDocumentPath = null;
        if ($request->hasFile('identity_document')) {
            $identityDocumentPath = $request->file('identity_document')->store('identity_documents', 'public');
        }

        $user = User::create([
            'name' => strtoupper($request->name),
            'phone_number' => $request->phone_number,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'identity_document' => $identityDocumentPath,
        ]);

        $role = $request->input('role', 'Customer');
        if (in_array($role, ['Freelancer', 'Customer'])) {
            $user->assignRole($role);
        } else {
            $user->assignRole('General User');
        }

        event(new Registered($user));

        Auth::login($user);

        // Freelancers: redirect to checkout or plan selection
        if ($role === 'Freelancer') {
            $planSlug = $request->input('plan');

            if ($planSlug) {
                $plan = \App\Models\SubscriptionPlan::where('slug', $planSlug)
                    ->where('is_active', true)
                    ->first();

                if ($plan) {
                    return redirect()->route('subscribe.checkout', $plan->slug);
                }
            }

            return redirect()->route('subscribe.plans');
        }

        return redirect(route('dashboard', absolute: false));
    }
}
