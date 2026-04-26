<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordResetTemplates;
use App\Services\SendoraService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Phone-based reset: generate a fresh password, hash it, mark the user
     * as must_change_password, and WhatsApp the cleartext via Sendora using
     * one of 20 randomised templates. Always returns the same generic
     * status message so the form can't be used to enumerate accounts.
     */
    public function store(Request $request, SendoraService $sendora): RedirectResponse
    {
        $request->validate([
            'phone_number' => 'required|string|max:20',
        ]);

        $genericMessage = 'If your phone number is registered, a temporary password has been sent to your WhatsApp.';

        $key = 'forgot-password:' . Str::lower($request->string('phone_number')) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return back()->with('status', $genericMessage);
        }
        RateLimiter::hit($key, 60);

        $user = User::where('phone_number', $request->phone_number)->first();
        if (!$user) {
            return back()->with('status', $genericMessage);
        }

        $newPassword = Str::password(20);

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'must_change_password' => true,
        ])->setRememberToken(Str::random(60));
        $user->save();

        $user->tokens()->delete();

        $sendora->sendMessage(
            $user->phone_number,
            PasswordResetTemplates::pick($user->name ?? '', $newPassword),
        );

        return back()->with('status', $genericMessage);
    }
}
