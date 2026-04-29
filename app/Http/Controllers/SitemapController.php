<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Support\SeoSettings;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $xml = Cache::remember(SeoSettings::SITEMAP_CACHE_KEY, 3600, function () {
            return $this->buildXml();
        });

        return Response::make($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function buildXml(): string
    {
        $host = SeoSettings::canonicalHost();
        $services = Service::where('is_active', true)
            ->select(['slug', 'updated_at'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $servicesLastmod = optional($services->first())->updated_at ?? Carbon::now();

        $urls = [];

        $urls[] = $this->urlEntry($host . '/', $servicesLastmod, 'daily', '1.0');
        $urls[] = $this->urlEntry($host . '/services', $servicesLastmod, 'daily', '0.9');

        foreach (['/about', '/privacy', '/terms', '/contact'] as $path) {
            $urls[] = $this->urlEntry($host . $path, Carbon::now()->subDays(30), 'monthly', '0.5');
        }

        foreach ($services as $service) {
            $urls[] = $this->urlEntry(
                $host . '/services/' . $service->slug,
                $service->updated_at,
                'weekly',
                '0.8',
            );
        }

        $body = implode("\n", $urls);

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{$body}
</urlset>

XML;
    }

    private function urlEntry(string $loc, $lastmod, string $changefreq, string $priority): string
    {
        $lastmodIso = $lastmod instanceof Carbon ? $lastmod->toAtomString() : Carbon::parse($lastmod)->toAtomString();
        $locEscaped = htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8');

        return <<<URL
  <url>
    <loc>{$locEscaped}</loc>
    <lastmod>{$lastmodIso}</lastmod>
    <changefreq>{$changefreq}</changefreq>
    <priority>{$priority}</priority>
  </url>
URL;
    }
}
