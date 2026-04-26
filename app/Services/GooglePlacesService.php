<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class GooglePlacesService
{
    private const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
    private const PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places/';

    private ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.google.places_api_key');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->apiKey);
    }

    /**
     * Autocomplete restaurant suggestions for the given query.
     * Biased to Penang, Malaysia.
     *
     * @return array<int, array{place_id:string, primary_text:string, secondary_text:string, full_text:string}>
     */
    public function autocomplete(string $query): array
    {
        $this->ensureConfigured();

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $this->apiKey,
            'X-Goog-FieldMask' => 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
        ])->post(self::AUTOCOMPLETE_URL, [
            'input' => $query,
            'includedPrimaryTypes' => ['restaurant', 'cafe', 'bakery', 'meal_takeaway', 'food'],
            'locationBias' => [
                'circle' => [
                    'center' => ['latitude' => 5.4164, 'longitude' => 100.3327], // Penang
                    'radius' => 50000.0,
                ],
            ],
            'regionCode' => 'MY',
        ]);

        if ($response->failed()) {
            Log::warning('Google Places autocomplete failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $suggestions = $response->json('suggestions') ?? [];

        return collect($suggestions)
            ->map(fn ($s) => $s['placePrediction'] ?? null)
            ->filter()
            ->map(function ($p) {
                $structured = $p['structuredFormat'] ?? [];
                return [
                    'place_id' => $p['placeId'] ?? '',
                    'primary_text' => $structured['mainText']['text'] ?? ($p['text']['text'] ?? ''),
                    'secondary_text' => $structured['secondaryText']['text'] ?? '',
                    'full_text' => $p['text']['text'] ?? '',
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Fetch full place details and download a thumbnail photo to local storage.
     * Returns the form-ready data the admin UI needs, or null if not found.
     */
    public function placeDetails(string $placeId): ?array
    {
        $this->ensureConfigured();

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $this->apiKey,
            'X-Goog-FieldMask' => 'id,displayName,formattedAddress,shortFormattedAddress,rating,userRatingCount,types,primaryTypeDisplayName,photos,location,googleMapsUri,nationalPhoneNumber,internationalPhoneNumber',
        ])->get(self::PLACE_DETAILS_URL . $placeId);

        if ($response->failed()) {
            Log::warning('Google Places details failed', [
                'place_id' => $placeId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return null;
        }

        $data = $response->json();

        $photoUrl = null;
        $photos = $data['photos'] ?? [];
        if (! empty($photos[0]['name'])) {
            $photoUrl = $this->downloadPhoto($photos[0]['name'], $placeId);
        }

        $cuisineType = $data['primaryTypeDisplayName']['text']
            ?? $this->humanizeType($data['types'][0] ?? null);

        return [
            'place_id' => $data['id'] ?? $placeId,
            'name' => $data['displayName']['text'] ?? '',
            'address' => $data['shortFormattedAddress']
                ?? $data['formattedAddress']
                ?? '',
            'phone_number' => $data['nationalPhoneNumber']
                ?? $data['internationalPhoneNumber']
                ?? '',
            'rating' => isset($data['rating']) ? (float) $data['rating'] : null,
            'rating_count' => $data['userRatingCount'] ?? null,
            'cuisine_type' => $cuisineType,
            'photo_url' => $photoUrl,
            'latitude' => $data['location']['latitude'] ?? null,
            'longitude' => $data['location']['longitude'] ?? null,
            'google_maps_url' => $data['googleMapsUri'] ?? null,
        ];
    }

    /**
     * Download a place photo (binary) and store it under public storage.
     * Returns the public URL, or null on failure.
     */
    private function downloadPhoto(string $photoName, string $placeId): ?string
    {
        $url = "https://places.googleapis.com/v1/{$photoName}/media?maxHeightPx=400&maxWidthPx=400&key={$this->apiKey}";

        try {
            $response = Http::withOptions(['allow_redirects' => true])
                ->timeout(10)
                ->get($url);

            if ($response->failed()) {
                Log::warning('Google place photo download failed', [
                    'photo_name' => $photoName,
                    'status' => $response->status(),
                ]);
                return null;
            }

            $extension = $this->extensionFromContentType($response->header('Content-Type'));
            $filename = 'halal-restaurants/' . md5($placeId) . '.' . $extension;
            Storage::disk('public')->put($filename, $response->body());

            return Storage::disk('public')->url($filename);
        } catch (\Throwable $e) {
            Log::warning('Google place photo exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function extensionFromContentType(?string $contentType): string
    {
        return match (true) {
            str_contains((string) $contentType, 'png') => 'png',
            str_contains((string) $contentType, 'webp') => 'webp',
            default => 'jpg',
        };
    }

    private function humanizeType(?string $type): ?string
    {
        if (! $type) return null;
        return ucwords(str_replace('_', ' ', $type));
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY in your .env file.');
        }
    }
}
