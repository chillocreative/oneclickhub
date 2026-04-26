<?php

namespace App\Http\Resources\V1;

use App\Models\AdminSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        $foundingPrice = (float) (AdminSetting::get('founding_member_starter_price') ?? 99);
        $isStarter = $this->slug === 'starter-hub';
        $foundingEligible = $isStarter
            && $user
            && method_exists($user, 'isFoundingMemberEligible')
            && $user->isFoundingMemberEligible();

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
            'requires_approval' => (bool) $this->requires_approval,
            'sponsored_by' => $this->sponsored_by,
            'max_services' => $this->max_services,
            'max_categories' => $this->max_categories,
            'founding_member_eligible' => $foundingEligible,
            'founding_member_price' => $isStarter ? $foundingPrice : null,
            'effective_price' => $foundingEligible ? $foundingPrice : (float) $this->price,
        ];
    }
}
