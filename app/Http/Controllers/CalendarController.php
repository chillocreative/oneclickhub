<?php

namespace App\Http\Controllers;

use App\Models\FreelancerAvailability;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $availabilities = FreelancerAvailability::where('user_id', $userId)
            ->where('date', '>=', today())
            ->get()
            ->map(fn($a) => ['date' => $a->date->format('Y-m-d'), 'type' => $a->type]);

        $bookedDates = Order::where('freelancer_id', $userId)
            ->whereNotIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])
            ->where('booking_date', '>=', today())
            ->pluck('booking_date')
            ->map(fn($d) => $d->format('Y-m-d'));

        return Inertia::render('Calendar/Manage', [
            'availabilities' => $availabilities,
            'bookedDates' => $bookedDates,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'dates' => 'required|array',
            'dates.*.date' => 'required|date|after_or_equal:today',
            'dates.*.type' => 'required|in:available,blocked',
        ]);

        foreach ($validated['dates'] as $entry) {
            FreelancerAvailability::updateOrCreate(
                ['user_id' => auth()->id(), 'date' => $entry['date']],
                ['type' => $entry['type']]
            );
        }

        return back()->with('success', 'Calendar updated successfully.');
    }

    public function removeDate(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        FreelancerAvailability::where('user_id', auth()->id())
            ->where('date', $validated['date'])
            ->delete();

        return back()->with('success', 'Date removed.');
    }

    public function getAvailability(User $user)
    {
        $availableDates = FreelancerAvailability::where('user_id', $user->id)
            ->where('date', '>=', today())
            ->available()
            ->pluck('date')
            ->map(fn($d) => $d->format('Y-m-d'));

        $bookedDates = Order::where('freelancer_id', $user->id)
            ->whereNotIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])
            ->where('booking_date', '>=', today())
            ->pluck('booking_date')
            ->map(fn($d) => $d->format('Y-m-d'));

        return response()->json([
            'availableDates' => $availableDates,
            'bookedDates' => $bookedDates,
        ]);
    }
}
