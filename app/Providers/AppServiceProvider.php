<?php

namespace App\Providers;

use App\Listeners\GrantEarlyAdopterSubscription;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Event::listen(Registered::class, GrantEarlyAdopterSubscription::class);

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
            if ($appUrl = config('app.url')) {
                URL::forceRootUrl($appUrl);
            }
        }
    }
}
