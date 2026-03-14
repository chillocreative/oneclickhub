<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FcmToken;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FcmTokenController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'device_name' => 'nullable|string|max:255',
        ]);

        // Link any existing guest token (user_id = null) to this user
        FcmToken::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $request->user()->id,
                'device_name' => $request->device_name,
            ]
        );

        return $this->success(null, 'FCM token registered.');
    }

    public function storeGuest(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        // Only create if token doesn't already exist (don't overwrite a linked user)
        FcmToken::firstOrCreate(
            ['token' => $request->token],
            [
                'user_id' => null,
                'device_name' => null,
            ]
        );

        return $this->success(null, 'Guest FCM token registered.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        FcmToken::where('user_id', $request->user()->id)
            ->where('token', $request->token)
            ->delete();

        return $this->success(null, 'FCM token removed.');
    }
}
