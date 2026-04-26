<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'remaining_days' => $this->remaining_days,
            'amount_paid' => $this->amount_paid,
            'payment_gateway' => $this->payment_gateway,
            'grant_type' => $this->grant_type,
            'plan' => $this->whenLoaded('plan', fn () => new SubscriptionPlanResource($this->plan)),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
