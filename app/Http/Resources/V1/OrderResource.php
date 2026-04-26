<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'status_label' => self::statusLabel($this->status),
            'booking_date' => $this->booking_date?->toDateString(),
            'agreed_price' => $this->agreed_price,
            'customer_notes' => $this->customer_notes,
            'payment_slip' => $this->payment_slip,
            'payment_slip_url' => $this->payment_slip
                ? Storage::disk('public')->url($this->payment_slip)
                : null,
            'cancellation_reason' => $this->cancellation_reason,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone_number' => $this->customer->phone_number,
            ]),
            'freelancer' => $this->whenLoaded('freelancer', fn () => [
                'id' => $this->freelancer->id,
                'name' => $this->freelancer->name,
                'phone_number' => $this->freelancer->phone_number,
                'banking_detail' => $this->freelancer->bankingDetail ? [
                    'bank_name' => $this->freelancer->bankingDetail->bank_name,
                    'account_number' => $this->freelancer->bankingDetail->account_number,
                    'account_holder_name' => $this->freelancer->bankingDetail->account_holder_name,
                ] : null,
            ]),
            'service' => $this->whenLoaded('service', fn () => [
                'id' => $this->service->id,
                'title' => $this->service->title,
                'slug' => $this->service->slug,
                'first_image' => self::firstImageUrl($this->service->images ?? null),
            ]),
            'review' => $this->whenLoaded('review', fn () => $this->review ? new ReviewResource($this->review) : null),
            'payment_slip_uploaded_at' => $this->payment_slip_uploaded_at?->toISOString(),
            'freelancer_responded_at' => $this->freelancer_responded_at?->toISOString(),
            'delivery_deadline_at' => $this->delivery_deadline_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    /**
     * Human-readable label that mirrors the customer-facing booking flow.
     */
    public static function statusLabel(?string $status): string
    {
        return match ($status) {
            'pending_payment' => 'Booking Confirmed',
            'pending_approval' => 'Awaiting Confirmation',
            'active' => 'Service Paid',
            'delivered' => 'Delivered',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'rejected' => 'Rejected',
            default => ucwords(str_replace('_', ' ', (string) $status)),
        };
    }

    private static function firstImageUrl($images): ?string
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
