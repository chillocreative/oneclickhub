<?php

namespace App\Notifications;

use App\Models\SsmVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SsmVerificationFailed extends Notification
{
    use Queueable;

    public function __construct(public SsmVerification $verification) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'ssm_verification_failed',
            'verification_id' => $this->verification->id,
            'user_name' => $this->verification->user?->name,
            'message' => "SSM verification failed for {$this->verification->user?->name}. Manual review required.",
        ];
    }
}
