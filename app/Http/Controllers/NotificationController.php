<?php

namespace App\Http\Controllers;

use App\Models\PushNotification;
use App\Services\FcmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = PushNotification::with('sender:id,name')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:1000',
            'target_role' => 'required|string|in:all,Freelancer,Customer',
        ]);

        $fcmService = new FcmService();
        $sentCount = $fcmService->sendToRole(
            $validated['target_role'],
            $validated['title'],
            $validated['body']
        );

        PushNotification::create([
            'title' => $validated['title'],
            'body' => $validated['body'],
            'target_role' => $validated['target_role'],
            'sent_count' => $sentCount,
            'sent_by' => $request->user()->id,
        ]);

        return Redirect::route('admin.notifications.index')
            ->with('success', "Notification sent to {$sentCount} device(s).");
    }
}
