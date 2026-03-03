<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'position' => $this->position,
            'identity_document' => $this->identity_document,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')),
            'subscription' => $this->whenLoaded('activeSubscription', function () {
                return $this->activeSubscription ? new SubscriptionResource($this->activeSubscription) : null;
            }),
            'ssm_verification' => $this->whenLoaded('ssmVerification', function () {
                return $this->ssmVerification ? new SsmVerificationResource($this->ssmVerification) : null;
            }),
            'banking_detail' => $this->whenLoaded('bankingDetail', function () {
                return $this->bankingDetail ? new BankingDetailResource($this->bankingDetail) : null;
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
