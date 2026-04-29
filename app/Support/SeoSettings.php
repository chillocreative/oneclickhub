<?php

namespace App\Support;

use App\Models\AdminSetting;
use Illuminate\Support\Facades\Cache;

class SeoSettings
{
    public const CACHE_KEY = 'seo.settings';
    public const SITEMAP_CACHE_KEY = 'seo.sitemap';
    public const ROBOTS_CACHE_KEY = 'seo.robots';

    public const FIELDS = [
        'site_name'                 => 'OneClickHub',
        'title_template'            => ':page | OneClickHub',
        'default_title'             => 'OneClickHub — One platform to launch and grow your services',
        'default_description'       => '',
        'default_keywords'          => '',
        'default_og_image'          => '',
        'canonical_host'            => '',
        'twitter_handle'            => '',
        'allow_indexing'            => '1',
        'organization_logo'         => '',
        'organization_legal_name'   => '',
        'organization_phone'        => '',
        'organization_email'        => '',
        'social_facebook'           => '',
        'social_twitter'            => '',
        'social_instagram'          => '',
        'social_linkedin'           => '',
        'social_youtube'            => '',
        'social_tiktok'             => '',
        'verification_google'       => '',
        'verification_bing'         => '',
        'verification_yandex'       => '',
        'verification_facebook'     => '',
        'ga4_measurement_id'        => '',
        'gtm_container_id'          => '',
        'facebook_pixel_id'         => '',
    ];

    public static function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $keys = array_map(fn ($k) => "seo.{$k}", array_keys(self::FIELDS));
            $values = AdminSetting::whereIn('key', $keys)->pluck('value', 'key')->all();

            $out = [];
            foreach (self::FIELDS as $field => $default) {
                $stored = $values["seo.{$field}"] ?? null;
                $out[$field] = ($stored === null || $stored === '') ? $default : $stored;
            }

            return $out;
        });
    }

    public static function get(string $field, $default = null)
    {
        $all = self::all();
        return $all[$field] ?? $default;
    }

    public static function set(string $field, ?string $value): void
    {
        AdminSetting::set("seo.{$field}", $value);
        self::flushCache();
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::SITEMAP_CACHE_KEY);
        Cache::forget(self::ROBOTS_CACHE_KEY);
    }

    public static function ogImageUrl(): ?string
    {
        return self::publicUrl(self::get('default_og_image'));
    }

    public static function organizationLogoUrl(): ?string
    {
        return self::publicUrl(self::get('organization_logo'));
    }

    public static function canonicalHost(): string
    {
        $host = (string) self::get('canonical_host', '');
        return $host !== '' ? rtrim($host, '/') : rtrim((string) config('app.url'), '/');
    }

    public static function allowsIndexing(): bool
    {
        return (string) self::get('allow_indexing', '1') === '1';
    }

    /** @return string[] */
    public static function socialLinks(): array
    {
        return array_values(array_filter(array_map('trim', [
            self::get('social_facebook', ''),
            self::get('social_twitter', ''),
            self::get('social_instagram', ''),
            self::get('social_linkedin', ''),
            self::get('social_youtube', ''),
            self::get('social_tiktok', ''),
        ])));
    }

    private static function publicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        return asset('storage/' . ltrim($path, '/'));
    }
}
