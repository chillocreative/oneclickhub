<?php

namespace App\Http\Controllers;

use App\Models\FreelancerAvailability;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::where('user_id', auth()->id())
            ->with('category')
            ->latest()
            ->paginate(12);

        return Inertia::render('Services/Index', [
            'services' => $services,
            'hasSubscription' => auth()->user()->hasActiveSubscription(),
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasActiveSubscription()) {
            return redirect()->route('subscribe.plans')
                ->with('error', 'You need an active subscription to create services.');
        }

        return Inertia::render('Services/Create', [
            'categories' => ServiceCategory::all(),
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasActiveSubscription()) {
            abort(403, 'Active subscription required.');
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

        auth()->user()->services()->create([
            'service_category_id' => $validated['service_category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price_from' => $validated['price_from'],
            'price_to' => $validated['price_to'] ?? null,
            'delivery_days' => $validated['delivery_days'] ?? null,
            'tags' => $tags,
            'images' => $imagePaths ?: null,
        ]);

        return redirect()->route('my-services.index')
            ->with('success', 'Service created successfully!');
    }

    public function edit(Service $service)
    {
        if ($service->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Services/Create', [
            'categories' => ServiceCategory::all(),
            'service' => $service->load('category'),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        if ($service->user_id !== auth()->id()) {
            abort(403);
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
            // Delete old images
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

        return redirect()->route('my-services.index')
            ->with('success', 'Service updated successfully!');
    }

    public function destroy(Service $service)
    {
        if ($service->user_id !== auth()->id()) {
            abort(403);
        }

        if ($service->images) {
            foreach ($service->images as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        $service->delete();

        return redirect()->route('my-services.index')
            ->with('success', 'Service deleted successfully!');
    }

    public function browse(Request $request)
    {
        $query = Service::active()->with(['user', 'category'])
            ->whereHas('user', function ($q) {
                $q->whereHas('ssmVerification', function ($sq) {
                    $sq->where('status', 'verified')
                        ->orWhere(function ($gq) {
                            $gq->whereNotNull('grace_period_ends_at')
                                ->where('grace_period_ends_at', '>', now());
                        });
                });
            });

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

        $services = $query->latest()->paginate(12)->withQueryString();
        $categories = ServiceCategory::all();

        return Inertia::render('Services/Browse', [
            'services' => $services,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function show(Service $service)
    {
        if (!$service->is_active) {
            abort(404);
        }

        $service->load(['user', 'category']);

        $relatedServices = Service::active()
            ->where('id', '!=', $service->id)
            ->where('service_category_id', $service->service_category_id)
            ->with(['user', 'category'])
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

        $reviews = \App\Models\Review::where('service_id', $service->id)
            ->with('customer')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Services/Show', [
            'service' => $service,
            'relatedServices' => $relatedServices,
            'availableDates' => $availableDates,
            'bookedDates' => $bookedDates,
            'reviews' => $reviews,
        ]);
    }
}
