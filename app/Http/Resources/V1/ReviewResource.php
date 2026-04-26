<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'freelancer_response' => $this->freelancer_response,
            'responded_at' => $this->responded_at?->toISOString(),
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
            ]),
            'freelancer' => $this->whenLoaded('freelancer', fn () => [
                'id' => $this->freelancer->id,
                'name' => $this->freelancer->name,
            ]),
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'title' => $this->service->title,
                'slug' => $this->service->slug,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
