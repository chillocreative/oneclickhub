<?php

namespace App\Http\Controllers;

use App\Models\HalalRestaurant;
use App\Services\GooglePlacesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class HalalRestaurantController extends Controller
{
    public function __construct(private GooglePlacesService $places)
    {
    }

    public function index()
    {
        $restaurants = HalalRestaurant::orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/HalalRestaurants', [
            'restaurants' => $restaurants,
            'googlePlacesEnabled' => $this->places->isConfigured(),
        ]);
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));

        if (strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        try {
            $suggestions = $this->places->autocomplete($query);
            return response()->json(['suggestions' => $suggestions]);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }

    public function placeDetails(Request $request): JsonResponse
    {
        $request->validate(['place_id' => 'required|string']);

        try {
            $details = $this->places->placeDetails($request->input('place_id'));
            if ($details === null) {
                return response()->json(['error' => 'Place not found.'], 404);
            }
            return response()->json(['place' => $details]);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 503);
        }
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        HalalRestaurant::create($data);

        return back()->with('success', 'Restaurant added successfully.');
    }

    public function update(Request $request, HalalRestaurant $restaurant)
    {
        $data = $this->validatedData($request, $restaurant->id);

        $restaurant->update($data);

        return back()->with('success', 'Restaurant updated successfully.');
    }

    public function destroy(HalalRestaurant $restaurant)
    {
        $restaurant->delete();

        return back()->with('success', 'Restaurant deleted successfully.');
    }

    private function validatedData(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'place_id' => 'nullable|string|unique:halal_restaurants,place_id' . ($ignoreId ? ",{$ignoreId}" : ''),
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'phone_number' => 'nullable|string|max:50',
            'rating' => 'nullable|numeric|between:0,5',
            'rating_count' => 'nullable|integer|min:0',
            'cuisine_type' => 'nullable|string|max:100',
            'photo_url' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'google_maps_url' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['sort_order'] = $request->input('sort_order', 0);
        $validated['phone_number'] = $validated['phone_number'] ?? '';

        return $validated;
    }
}
