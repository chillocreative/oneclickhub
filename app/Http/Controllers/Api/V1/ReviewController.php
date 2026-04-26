<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ReviewResource;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    /**
     * List every review across services owned by the current freelancer,
     * newest first. Drives the My Reviews screen.
     */
    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::where('freelancer_id', $request->user()->id)
            ->with(['customer', 'service', 'freelancer'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return $this->paginatedResource($reviews, ReviewResource::class);
    }

    /**
     * Freelancer creates or replaces their reply on a review they own.
     * One reply per review — re-posting overwrites.
     */
    public function respond(Request $request, Review $review): JsonResponse
    {
        if ($review->freelancer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $review->update([
            'freelancer_response' => $request->body,
            'responded_at' => now(),
        ]);

        return $this->success(
            new ReviewResource($review->fresh()->load(['customer', 'freelancer', 'service'])),
            'Reply saved.'
        );
    }

    /**
     * Freelancer removes their own reply.
     */
    public function removeResponse(Request $request, Review $review): JsonResponse
    {
        if ($review->freelancer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        $review->update([
            'freelancer_response' => null,
            'responded_at' => null,
        ]);

        return $this->success(
            new ReviewResource($review->fresh()->load(['customer', 'freelancer', 'service'])),
            'Reply removed.'
        );
    }
}
