<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SsmServicesHidden extends Notification
{
    use Queueable;

    public function __construct(public string $freelancerName = '') {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        if ($this->freelancerName) {
            return [
                'type' => 'ssm_services_hidden_admin',
                'message' => "Services for freelancer {$this->freelancerName} have been hidden due to expired SSM grace period.",
            ];
        }

        return [
            'type' => 'ssm_services_hidden',
            'message' => 'Your services have been hidden because your SSM verification grace period has expired. Upload a valid SSM certificate to reactivate.',
        ];
    }
}
