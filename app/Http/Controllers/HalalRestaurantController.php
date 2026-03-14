<?php

namespace App\Http\Controllers;

use App\Models\HalalRestaurant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HalalRestaurantController extends Controller
{
    public function index()
    {
        $restaurants = HalalRestaurant::orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/HalalRestaurants', [
            'restaurants' => $restaurants,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'phone_number' => 'required|string|max:50',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        HalalRestaurant::create([
            'name' => $request->name,
            'address' => $request->address,
            'phone_number' => $request->phone_number,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return back()->with('success', 'Restaurant added successfully.');
    }

    public function update(Request $request, HalalRestaurant $restaurant)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'phone_number' => 'required|string|max:50',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $restaurant->update([
            'name' => $request->name,
            'address' => $request->address,
            'phone_number' => $request->phone_number,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        return back()->with('success', 'Restaurant updated successfully.');
    }

    public function destroy(HalalRestaurant $restaurant)
    {
        $restaurant->delete();

        return back()->with('success', 'Restaurant deleted successfully.');
    }
}
