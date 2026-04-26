<?php

namespace App\Console\Commands;

use App\Services\AdminWhatsappNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SendoraClearThrottle extends Command
{
    protected $signature = 'sendora:clear-throttle';
    protected $description = 'Release the admin WhatsApp throttle slot so the next contact / notify event fires immediately.';

    public function handle(): int
    {
        $existed = Cache::pull(AdminWhatsappNotifier::SLOT_KEY) !== null;
        if ($existed) {
            $this->info('Throttle slot cleared. The next admin event will send WhatsApp without delay.');
        } else {
            $this->line('No throttle slot was set — nothing to clear.');
        }
        return self::SUCCESS;
    }
}
