<?php

namespace App\Http\Middleware;

use App\Support\SeoSettings;
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
                    [
                        'roles' => $user->getRoleNames(),
                        'profile_picture_url' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
                    ]
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
            'seo' => fn () => $this->seoPayload($request),
        ];
    }

    private function seoPayload(Request $request): array
    {
        $settings = SeoSettings::all();
        $canonicalHost = SeoSettings::canonicalHost();
        $path = $request->getPathInfo();

        return [
            'siteName'           => $settings['site_name'] ?? 'OneClickHub',
            'titleTemplate'      => $settings['title_template'] ?? ':page',
            'defaultTitle'       => $settings['default_title'] ?? '',
            'defaultDescription' => $settings['default_description'] ?? '',
            'defaultKeywords'    => $settings['default_keywords'] ?? '',
            'defaultOgImage'     => SeoSettings::ogImageUrl(),
            'organizationLogo'   => SeoSettings::organizationLogoUrl(),
            'organizationName'   => $settings['organization_legal_name'] ?: ($settings['site_name'] ?? 'OneClickHub'),
            'organizationPhone'  => $settings['organization_phone'] ?? '',
            'organizationEmail'  => $settings['organization_email'] ?? '',
            'socialLinks'        => SeoSettings::socialLinks(),
            'canonicalHost'      => $canonicalHost,
            'currentUrl'         => $canonicalHost . $path,
            'twitterHandle'      => $settings['twitter_handle'] ?? '',
            'allowIndexing'      => SeoSettings::allowsIndexing(),
            'locale'             => str_replace('_', '-', app()->getLocale()),
        ];
    }
}
