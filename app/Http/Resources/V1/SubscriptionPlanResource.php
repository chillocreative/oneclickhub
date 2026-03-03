<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => $this->price,
            'formatted_price' => $this->formatted_price,
            'interval' => $this->interval,
            'interval_label' => $this->interval_label,
            'features' => $this->features,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'is_popular' => $this->is_popular,
        ];
    }
}
