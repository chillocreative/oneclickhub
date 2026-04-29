<?php

namespace App\Http\Controllers;

use App\Support\SeoSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SeoSettingsController extends Controller
{
    private const TEXT_FIELDS = [
        'site_name', 'title_template', 'default_title', 'default_description',
        'default_keywords', 'canonical_host', 'twitter_handle',
        'organization_legal_name', 'organization_phone', 'organization_email',
        'social_facebook', 'social_twitter', 'social_instagram',
        'social_linkedin', 'social_youtube', 'social_tiktok',
        'verification_google', 'verification_bing', 'verification_yandex',
        'verification_facebook', 'ga4_measurement_id', 'gtm_container_id',
        'facebook_pixel_id',
    ];

    public function index()
    {
        $settings = SeoSettings::all();

        return Inertia::render('Admin/SeoSettings', [
            'settings' => array_merge($settings, [
                'allow_indexing' => (string) ($settings['allow_indexing'] ?? '1') === '1',
            ]),
            'previews' => [
                'default_og_image' => SeoSettings::ogImageUrl(),
                'organization_logo' => SeoSettings::organizationLogoUrl(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'site_name'                 => 'nullable|string|max:120',
            'title_template'            => 'nullable|string|max:255',
            'default_title'             => 'nullable|string|max:255',
            'default_description'       => 'nullable|string|max:320',
            'default_keywords'          => 'nullable|string|max:500',
            'default_og_image'          => 'nullable|image|max:5120',
            'canonical_host'            => 'nullable|url|max:255',
            'twitter_handle'            => 'nullable|string|max:32',
            'allow_indexing'            => 'nullable|boolean',
            'organization_logo'         => 'nullable|image|max:5120',
            'organization_legal_name'   => 'nullable|string|max:255',
            'organization_phone'        => 'nullable|string|max:32',
            'organization_email'        => 'nullable|email|max:255',
            'social_facebook'           => 'nullable|url|max:255',
            'social_twitter'            => 'nullable|url|max:255',
            'social_instagram'          => 'nullable|url|max:255',
            'social_linkedin'           => 'nullable|url|max:255',
            'social_youtube'            => 'nullable|url|max:255',
            'social_tiktok'             => 'nullable|url|max:255',
            'verification_google'       => 'nullable|string|max:255',
            'verification_bing'         => 'nullable|string|max:255',
            'verification_yandex'       => 'nullable|string|max:255',
            'verification_facebook'     => 'nullable|string|max:255',
            'ga4_measurement_id'        => 'nullable|string|max:32',
            'gtm_container_id'          => 'nullable|string|max:32',
            'facebook_pixel_id'         => 'nullable|string|max:32',
        ]);

        foreach (self::TEXT_FIELDS as $field) {
            if ($request->has($field)) {
                SeoSettings::set($field, (string) $request->input($field, ''));
            }
        }

        if ($request->has('allow_indexing')) {
            SeoSettings::set('allow_indexing', $request->boolean('allow_indexing') ? '1' : '0');
        }

        $this->handleImageUpload($request, 'default_og_image');
        $this->handleImageUpload($request, 'organization_logo');

        return back()->with('success', 'SEO settings updated.');
    }

    private function handleImageUpload(Request $request, string $field): void
    {
        if (! $request->hasFile($field)) {
            return;
        }

        $existing = (string) SeoSettings::get($field, '');
        if ($existing !== '' && ! str_starts_with($existing, 'http')) {
            Storage::disk('public')->delete($existing);
        }

        $path = $request->file($field)->store('seo', 'public');
        SeoSettings::set($field, $path);
    }
}
