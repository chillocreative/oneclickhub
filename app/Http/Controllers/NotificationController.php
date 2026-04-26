<?php

namespace App\Http\Controllers;

use App\Models\FcmToken;
use App\Models\PushNotification;
use App\Services\FcmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = PushNotification::with('sender:id,name')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $diagnostics = [
            'total_tokens' => FcmToken::count(),
            'credentials_exists' => file_exists(storage_path('app/firebase-credentials.json')),
            'history_total' => PushNotification::count(),
        ];

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications,
            'diagnostics' => $diagnostics,
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

    /**
     * Delete a single notification from the history table.
     * Does NOT recall the push from the recipient's device — that's
     * impossible once delivered. This only clears it from admin history.
     */
    public function destroy(PushNotification $notification): RedirectResponse
    {
        $notification->delete();

        return back()->with('success', 'Notification removed from history.');
    }

    /**
     * Clear the entire notification history table. Also a no-op against
     * already-delivered pushes — only the admin-facing log is wiped.
     */
    public function clearAll(): RedirectResponse
    {
        $count = PushNotification::count();
        PushNotification::truncate();

        return back()->with(
            'success',
            "Cleared {$count} notification" . ($count === 1 ? '' : 's') . ' from history.'
        );
    }
}
