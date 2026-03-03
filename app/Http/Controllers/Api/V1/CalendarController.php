<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FreelancerAvailability;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $availabilities = FreelancerAvailability::where('user_id', $userId)
            ->where('date', '>=', today())
            ->get()
            ->map(fn($a) => ['date' => $a->date->format('Y-m-d'), 'type' => $a->type]);

        $bookedDates = Order::where('freelancer_id', $userId)
            ->whereNotIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])
            ->where('booking_date', '>=', today())
            ->pluck('booking_date')
            ->map(fn($d) => $d->format('Y-m-d'));

        return $this->success([
            'availabilities' => $availabilities,
            'booked_dates' => $bookedDates,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dates' => 'required|array',
            'dates.*.date' => 'required|date|after_or_equal:today',
            'dates.*.type' => 'required|in:available,blocked',
        ]);

        foreach ($validated['dates'] as $entry) {
            FreelancerAvailability::updateOrCreate(
                ['user_id' => $request->user()->id, 'date' => $entry['date']],
                ['type' => $entry['type']]
            );
        }

        return $this->success(null, 'Calendar updated successfully.');
    }

    public function removeDate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        FreelancerAvailability::where('user_id', $request->user()->id)
            ->where('date', $validated['date'])
            ->delete();

        return $this->success(null, 'Date removed.');
    }
}
