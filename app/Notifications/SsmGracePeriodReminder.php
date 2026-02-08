<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SsmGracePeriodReminder extends Notification
{
    use Queueable;

    public function __construct(public int $daysRemaining) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'ssm_grace_reminder',
            'message' => "Your SSM verification grace period expires in {$this->daysRemaining} day(s). Upload your SSM certificate to keep your services visible.",
            'days_remaining' => $this->daysRemaining,
        ];
    }
}
