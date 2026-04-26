<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\BankingDetailResource;
use App\Http\Resources\V1\SsmVerificationResource;
use App\Http\Resources\V1\UserResource;
use App\Models\AdminSetting;
use App\Models\PushNotification;
use App\Models\Service;
use App\Models\SsmVerification;
use App\Models\User;
use App\Services\SsmAiVerifier;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    use ApiResponse;

    public function __construct(private SsmAiVerifier $verifier)
    {
    }

    public function profile(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load('roles')));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'sometimes|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'company_name' => 'nullable|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $user->profile_picture = $request->file('profile_picture')->store('profile-pictures', 'public');
        }

        unset($validated['profile_picture']);
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $this->success(new UserResource($user->load('roles')), 'Profile updated successfully.');
    }

    public function bankingDetail(Request $request): JsonResponse
    {
        $banking = $request->user()->bankingDetail;

        return $this->success(
            $banking ? new BankingDetailResource($banking) : null
        );
    }

    public function updateBanking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:255',
        ]);

        $request->user()->bankingDetail()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return $this->success(null, 'Banking details updated successfully.');
    }

    public function ssmCertificate(Request $request): JsonResponse
    {
        $ssm = $request->user()->ssmVerification;

        $data = null;
        if ($ssm) {
            $data = new SsmVerificationResource($ssm);
        }

        return $this->success($data);
    }

    public function uploadSsm(Request $request): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('document')->store('ssm-documents', 'public');

        $verification = SsmVerification::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'document_path' => $path,
                'status' => 'pending',
                'company_name' => null,
                'registration_number' => null,
                'expiry_date' => null,
                'ai_response' => null,
            ]
        );

        $this->verifier->verify($verification);

        return $this->success(
            new SsmVerificationResource($verification->fresh()),
            'SSM document uploaded. Verification is being processed.'
        );
    }

    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $roles = $user->getRoleNames()->toArray();

        $notifications = PushNotification::where(function ($q) use ($roles) {
            $q->where('target_role', 'all')
              ->orWhereIn('target_role', $roles);
        })
            ->latest()
            ->take(50)
            ->get(['id', 'title', 'body', 'target_role', 'created_at']);

        $unreadCount = PushNotification::where(function ($q) use ($roles) {
            $q->where('target_role', 'all')
              ->orWhereIn('target_role', $roles);
        })
            ->when($user->notification_read_at, function ($q) use ($user) {
                $q->where('created_at', '>', $user->notification_read_at);
            })
            ->count();

        return $this->success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function guestNotifications(): JsonResponse
    {
        $notifications = PushNotification::where('target_role', 'all')
            ->latest()
            ->take(50)
            ->get(['id', 'title', 'body', 'target_role', 'created_at']);

        return $this->success([
            'notifications' => $notifications,
        ]);
    }

    public function markNotificationsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->notification_read_at = now();
        $user->save();

        $user->unreadNotifications->markAsRead();

        return $this->success(null, 'Notifications marked as read.');
    }
}
