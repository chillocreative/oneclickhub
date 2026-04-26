<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Freelancer dashboard: list every review on services they own with
     * inline reply controls.
     */
    public function myReviews(Request $request): Response
    {
        $reviews = Review::where('freelancer_id', $request->user()->id)
            ->with(['customer', 'service'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $totals = Review::where('freelancer_id', $request->user()->id);
        $stats = [
            'total' => (clone $totals)->count(),
            'with_response' => (clone $totals)->whereNotNull('responded_at')->count(),
            'avg_rating' => round((float) (clone $totals)->avg('rating'), 1),
        ];

        return Inertia::render('Reviews/Index', [
            'reviews' => $reviews,
            'stats' => $stats,
        ]);
    }

    public function respond(Request $request, Review $review): RedirectResponse
    {
        if ($review->freelancer_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $review->update([
            'freelancer_response' => $request->body,
            'responded_at' => now(),
        ]);

        return back()->with('success', 'Reply saved.');
    }

    public function removeResponse(Request $request, Review $review): RedirectResponse
    {
        if ($review->freelancer_id !== auth()->id()) {
            abort(403);
        }

        $review->update([
            'freelancer_response' => null,
            'responded_at' => null,
        ]);

        return back()->with('success', 'Reply removed.');
    }
}
