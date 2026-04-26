<?php

namespace App\Jobs;

use App\Services\SendoraService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAdminWhatsappAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $body;

    public function __construct(string $body)
    {
        $this->body = $body;
    }

    public function handle(SendoraService $sendora): void
    {
        $phone = config('sendora.admin_phone');
        if (!$phone) {
            return;
        }
        $sendora->sendMessage($phone, $this->body);
    }
}
