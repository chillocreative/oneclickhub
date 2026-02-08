<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderAutoCancel extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'order_auto_cancel',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'message' => "Order #{$this->order->order_number} was auto-cancelled (freelancer did not respond within 24h).",
        ];
    }
}
