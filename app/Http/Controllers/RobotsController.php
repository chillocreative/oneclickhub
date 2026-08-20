<?php

namespace App\Http\Controllers;

use App\Support\SeoSettings;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Response;

class RobotsController extends Controller
{
    public function index()
    {
        $body = Cache::remember(SeoSettings::ROBOTS_CACHE_KEY, 3600, function () {
            return $this->buildBody();
        });

        return Response::make($body, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }

    private function buildBody(): string
    {
        if (! SeoSettings::allowsIndexing()) {
            return "User-agent: *\nDisallow: /\n";
        }

        $host = SeoSettings::canonicalHost();

        return <<<TXT
User-agent: *
Disallow: /admin
Disallow: /dashboard
Disallow: /chat
Disallow: /orders
Disallow: /payment
Disallow: /api
Disallow: /profile
Disallow: /cgi-bin/
Allow: /

Sitemap: {$host}/sitemap.xml

TXT;
    }
}
