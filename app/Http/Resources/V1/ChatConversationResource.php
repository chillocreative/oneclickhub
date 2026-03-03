<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currentUserId = $request->user()?->id;

        return [
            'id' => $this->id,
            'type' => $this->type,
            'other_user' => $this->when($currentUserId, function () use ($currentUserId) {
                $other = $this->getOtherUser($currentUserId);
                return $other ? [
                    'id' => $other->id,
                    'name' => $other->name,
                ] : null;
            }),
            'order' => $this->whenLoaded('order', fn () => $this->order ? [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'service' => $this->order->service ? [
                    'title' => $this->order->service->title,
                ] : null,
            ] : null),
            'last_message' => $this->whenLoaded('messages', function () {
                $lastMessage = $this->messages->first();
                return $lastMessage ? [
                    'body' => $lastMessage->body,
                    'sender_id' => $lastMessage->sender_id,
                    'created_at' => $lastMessage->created_at?->toISOString(),
                ] : null;
            }),
            'unread_count' => $this->when(isset($this->unread_count), $this->unread_count),
            'last_message_at' => $this->last_message_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
