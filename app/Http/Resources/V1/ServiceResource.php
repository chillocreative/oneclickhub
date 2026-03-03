<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price_from' => $this->price_from,
            'price_to' => $this->price_to,
            'delivery_days' => $this->delivery_days,
            'tags' => $this->tags,
            'images' => collect($this->images)->map(fn ($path) => $path ? Storage::disk('public')->url($path) : null)->filter()->values(),
            'is_active' => $this->is_active,
            'category' => $this->whenLoaded('category', fn () => new ServiceCategoryResource($this->category)),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'position' => $this->user->position,
            ]),
            'reviews_count' => $this->whenCounted('reviews'),
            'reviews_avg_rating' => $this->when(
                isset($this->reviews_avg_rating),
                fn () => round((float) $this->reviews_avg_rating, 1)
            ),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
