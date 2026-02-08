<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $unreadMessages = 0;
        $notificationCount = 0;

        if ($user) {
            $unreadMessages = \App\Models\ChatMessage::whereHas('conversation', function ($q) use ($user) {
                $q->where('user_one_id', $user->id)->orWhere('user_two_id', $user->id);
            })->where('sender_id', '!=', $user->id)->whereNull('read_at')->count();

            if ($user->hasRole('Admin')) {
                $notificationCount = $user->unreadNotifications()->count();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge(
                    $user->toArray(),
                    ['roles' => $user->getRoleNames()]
                ) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'unreadMessages' => $unreadMessages,
            'notificationCount' => $notificationCount,
            'ssm' => $user && $user->hasRole('Freelancer') ? [
                'status' => $user->ssmStatus(),
                'graceDaysRemaining' => $user->ssmGraceDaysRemaining(),
                'servicesHidden' => (bool) $user->ssmVerification?->services_hidden_at,
            ] : null,
        ];
    }
}
