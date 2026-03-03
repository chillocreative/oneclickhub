<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ServiceCategoryResource;
use App\Http\Resources\V1\ServiceResource;
use App\Http\Resources\V1\ReviewResource;
use App\Models\FreelancerAvailability;
use App\Models\Order;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    use ApiResponse;

    public function categories(): JsonResponse
    {
        $categories = ServiceCategory::withCount('services')->get();

        return $this->success(ServiceCategoryResource::collection($categories));
    }

    public function browse(Request $request): JsonResponse
    {
        $query = Service::active()->with(['user', 'category'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating');

        if (Schema::hasTable('ssm_verifications')) {
            $query->whereHas('user', function ($q) {
                $q->whereHas('ssmVerification', function ($sq) {
                    $sq->where('status', 'verified')
                        ->orWhere(function ($gq) {
                            $gq->whereNotNull('grace_period_ends_at')
                                ->where('grace_period_ends_at', '>', now());
                        });
                });
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('service_category_id', $request->category);
        }

        $services = $query->latest()->paginate($request->input('per_page', 12));

        return $this->paginated($services);
    }

    public function show(Service $service): JsonResponse
    {
        if (!$service->is_active) {
            return $this->notFound('Service not found');
        }

        $service->load(['user', 'category'])
            ->loadCount('reviews')
            ->loadAvg('reviews', 'rating');

        $relatedServices = Service::active()
            ->where('id', '!=', $service->id)
            ->where('service_category_id', $service->service_category_id)
            ->with(['user', 'category'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->take(4)
            ->get();

        $availableDates = FreelancerAvailability::where('user_id', $service->user_id)
            ->where('date', '>=', today())
            ->where('type', 'available')
            ->pluck('date')
            ->map(fn($d) => $d->format('Y-m-d'));

        $bookedDates = Order::where('freelancer_id', $service->user_id)
            ->whereNotIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])
            ->where('booking_date', '>=', today())
            ->pluck('booking_date')
            ->map(fn($d) => $d->format('Y-m-d'));

        $reviews = Review::where('service_id', $service->id)
            ->with('customer')
            ->latest()
            ->take(10)
            ->get();

        return $this->success([
            'service' => new ServiceResource($service),
            'related_services' => ServiceResource::collection($relatedServices),
            'available_dates' => $availableDates,
            'booked_dates' => $bookedDates,
            'reviews' => ReviewResource::collection($reviews),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $services = Service::where('user_id', $request->user()->id)
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->latest()
            ->paginate($request->input('per_page', 12));

        return $this->paginated($services);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->hasActiveSubscription()) {
            return $this->forbidden('Active subscription required to create services.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'service_category_id' => 'required|exists:service_categories,id',
            'price_from' => 'required|numeric|min:0',
            'price_to' => 'nullable|numeric|min:0|gte:price_from',
            'delivery_days' => 'nullable|integer|min:1',
            'tags' => 'nullable|string',
            'images.*' => 'nullable|image|max:2048',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('services', 'public');
            }
        }

        $tags = !empty($validated['tags'])
            ? array_map('trim', explode(',', $validated['tags']))
            : null;

        $service = $request->user()->services()->create([
            'service_category_id' => $validated['service_category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price_from' => $validated['price_from'],
            'price_to' => $validated['price_to'] ?? null,
            'delivery_days' => $validated['delivery_days'] ?? null,
            'tags' => $tags,
            'images' => $imagePaths ?: null,
        ]);

        return $this->success(
            new ServiceResource($service->load('category')),
            'Service created successfully',
            201
        );
    }

    public function edit(Service $service, Request $request): JsonResponse
    {
        if ($service->user_id !== $request->user()->id) {
            return $this->forbidden();
        }

        return $this->success([
            'service' => new ServiceResource($service->load('category')),
            'categories' => ServiceCategoryResource::collection(ServiceCategory::all()),
        ]);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        if ($service->user_id !== $request->user()->id) {
            return $this->forbidden();
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'service_category_id' => 'required|exists:service_categories,id',
            'price_from' => 'required|numeric|min:0',
            'price_to' => 'nullable|numeric|min:0|gte:price_from',
            'delivery_days' => 'nullable|integer|min:1',
            'tags' => 'nullable|string',
            'images.*' => 'nullable|image|max:2048',
        ]);

        $imagePaths = $service->images ?? [];
        if ($request->hasFile('images')) {
            foreach ($imagePaths as $path) {
                Storage::disk('public')->delete($path);
            }
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('services', 'public');
            }
        }

        $tags = !empty($validated['tags'])
            ? array_map('trim', explode(',', $validated['tags']))
            : null;

        $service->update([
            'service_category_id' => $validated['service_category_id'],
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
            'description' => $validated['description'],
            'price_from' => $validated['price_from'],
            'price_to' => $validated['price_to'] ?? null,
            'delivery_days' => $validated['delivery_days'] ?? null,
            'tags' => $tags,
            'images' => $imagePaths ?: null,
        ]);

        return $this->success(
            new ServiceResource($service->fresh()->load('category')),
            'Service updated successfully'
        );
    }

    public function destroy(Service $service, Request $request): JsonResponse
    {
        if ($service->user_id !== $request->user()->id) {
            return $this->forbidden();
        }

        if ($service->images) {
            foreach ($service->images as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        $service->delete();

        return $this->success(null, 'Service deleted successfully');
    }
}
