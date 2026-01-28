<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'phone_number' => 'required|string',
        ]);

        // Simulating the WhatsApp Send for the UI
        // In a real production app, you would verify the phone exists and trigger a WhatsApp API (e.g., Twilio)
        $userExists = \App\Models\User::where('phone_number', $request->phone_number)->exists();

        if ($userExists) {
            return back()->with('status', 'A password reset link has been sent to your WhatsApp number.');
        }

        throw ValidationException::withMessages([
            'phone_number' => ['We could not find a user with that phone number.'],
        ]);
    }
}
