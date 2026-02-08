<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    public function index()
    {
        $categories = ServiceCategory::withCount('services')->orderBy('name')->get();

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name',
            'description' => 'nullable|string|max:1000',
        ]);

        ServiceCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, ServiceCategory $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:service_categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(ServiceCategory $category)
    {
        if ($category->services()->count() > 0) {
            return back()->withErrors(['category' => 'Cannot delete a category that has services.']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
