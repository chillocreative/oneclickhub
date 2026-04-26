<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attachmentMime = null;
        if ($this->attachment) {
            $ext = strtolower(pathinfo($this->attachment, PATHINFO_EXTENSION));
            $attachmentMime = match ($ext) {
                'jpg', 'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'pdf' => 'application/pdf',
                default => 'application/octet-stream',
            };
        }

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'body' => $this->body,
            'attachment' => $this->attachment,
            'attachment_url' => $this->attachment
                ? Storage::disk('public')->url($this->attachment)
                : null,
            'attachment_mime' => $attachmentMime,
            'attachment_name' => $this->attachment
                ? basename($this->attachment)
                : null,
            'read_at' => $this->read_at?->toISOString(),
            'sender' => $this->whenLoaded('sender', fn () => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
