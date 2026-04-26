<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\SsmVerification;
use App\Models\User;
use App\Services\PasswordResetTemplates;
use App\Services\SendoraService;
use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'phone_number' => 'required|digits_between:10,11|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|string|in:Freelancer,Customer',
            'identity_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $identityDocumentPath = null;
        if ($request->hasFile('identity_document')) {
            $identityDocumentPath = $request->file('identity_document')->store('ssm-documents', 'public');
        }

        $user = User::create([
            'name' => strtoupper($validated['name']),
            'company_name' => $validated['company_name'] ?? null,
            'business_name' => $validated['business_name'] ?? null,
            'phone_number' => $validated['phone_number'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'identity_document' => $identityDocumentPath,
        ]);

        $role = $validated['role'] ?? 'Customer';
        if (in_array($role, ['Freelancer', 'Customer'])) {
            $user->assignRole($role);
        } else {
            $user->assignRole('General User');
        }

        // Auto-create SSM verification record for freelancers who upload a document
        if ($role === 'Freelancer' && $identityDocumentPath) {
            SsmVerification::create([
                'user_id' => $user->id,
                'document_path' => $identityDocumentPath,
                'status' => 'pending',
            ]);
        }

        event(new Registered($user));

        $token = $user->createToken('mobile')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user->load([
                'roles',
                'activeSubscription.plan',
                'ssmVerification',
                'bankingDetail',
            ])),
            'token' => $token,
        ], 'Registration successful', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = Str::transliterate(
            Str::lower($request->string('phone_number')) . '|' . $request->ip()
        );

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return $this->error(
                trans('auth.throttle', ['seconds' => $seconds, 'minutes' => ceil($seconds / 60)]),
                429
            );
        }

        if (!Auth::attempt($request->only('phone_number', 'password'))) {
            RateLimiter::hit($throttleKey);

            return $this->error(trans('auth.failed'), 401);
        }

        RateLimiter::clear($throttleKey);

        $user = Auth::user();
        $token = $user->createToken('mobile')->plainTextToken;

        return $this->success([
            'user' => new UserResource($user->load([
                'roles',
                'activeSubscription.plan',
                'ssmVerification',
                'bankingDetail',
            ])),
            'token' => $token,
        ], 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'roles',
            'activeSubscription.plan',
            'ssmVerification',
            'bankingDetail',
        ]);

        return $this->success([
            'user' => new UserResource($user),
            'ssm' => [
                'status' => $user->ssmStatus(),
                'grace_days_remaining' => $user->ssmGraceDaysRemaining(),
                'services_hidden' => !$user->canShowServices(),
            ],
        ]);
    }

    /**
     * Phone-based password reset via Sendora WhatsApp.
     *
     * Generates a fresh 20-character password, hashes it, marks the user as
     * must_change_password, and WhatsApps the cleartext password using one
     * of 20 randomised templates. Returns a generic 200 response either way
     * so the form can't be used to enumerate accounts.
     */
    public function forgotPassword(Request $request, SendoraService $sendora): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string|max:20',
        ]);

        $genericMessage = 'If your phone number is registered, a temporary password has been sent via WhatsApp.';

        // Throttle by phone+ip to stop spray attacks.
        $throttleKey = 'forgot-password:' . Str::lower($request->string('phone_number')) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return $this->error(
                trans('auth.throttle', [
                    'seconds' => RateLimiter::availableIn($throttleKey),
                    'minutes' => 1,
                ]),
                429,
            );
        }
        RateLimiter::hit($throttleKey, 60);

        $user = User::where('phone_number', $request->phone_number)->first();
        if (!$user) {
            return $this->success(null, $genericMessage);
        }

        $newPassword = Str::password(20);

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'must_change_password' => true,
        ])->setRememberToken(Str::random(60));
        $user->save();

        // Invalidate all existing API tokens so old sessions can't keep going.
        $user->tokens()->delete();

        $body = PasswordResetTemplates::pick($user->name ?? '', $newPassword);
        $sendora->sendMessage($user->phone_number, $body);

        return $this->success(null, $genericMessage);
    }

    /**
     * Force-rotate the current user's password. Used after the temporary
     * Sendora password lands them in the app (must_change_password = true).
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [trans('auth.password')],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
        ])->save();

        return $this->success(null, 'Password updated.');
    }
}
