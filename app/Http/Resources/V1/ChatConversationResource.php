<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
                'status' => $this->order->status,
                'booking_date' => $this->order->booking_date?->toDateString(),
                'agreed_price' => $this->order->agreed_price,
                'service' => $this->order->service ? [
                    'id' => $this->order->service->id,
                    'title' => $this->order->service->title,
                    'slug' => $this->order->service->slug,
                    'first_image' => $this->firstImageUrl($this->order->service?->images),
                ] : null,
            ] : null),
            'service' => $this->whenLoaded('service', fn () => $this->service ? [
                'id' => $this->service->id,
                'title' => $this->service->title,
                'slug' => $this->service->slug,
                'price_from' => $this->service->price_from,
                'price_to' => $this->service->price_to,
                'first_image' => $this->firstImageUrl($this->service->images),
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

    private function firstImageUrl($images): ?string
    {
        if (empty($images) || !is_array($images)) {
            return null;
        }
        $path = $images[0] ?? null;
        if (!$path) {
            return null;
        }
        return Storage::disk('public')->url($path);
    }
}
