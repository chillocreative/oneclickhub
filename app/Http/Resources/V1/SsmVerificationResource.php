<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SsmVerificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'registration_number' => $this->registration_number,
            'expiry_date' => $this->expiry_date?->toDateString(),
            'status' => $this->status,
            'document_path' => $this->document_path,
            'admin_notes' => $this->admin_notes,
            'verified_at' => $this->verified_at?->toISOString(),
            'grace_period_ends_at' => $this->grace_period_ends_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
