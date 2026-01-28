<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function freelancers()
    {
        $users = User::role('Freelancer')->get();
        return Inertia::render('Users/Freelancers', [
            'users' => $users
        ]);
    }

    public function customers()
    {
        $users = User::role('Customer')->get();
        return Inertia::render('Users/Customers', [
            'users' => $users
        ]);
    }

    public function admins()
    {
        $users = User::role('Admin')->get();
        return Inertia::render('Users/Admins', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users',
            'email' => 'nullable|email|max:255|unique:users',
            'position' => 'nullable|string|max:255',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone_number' => $request->phone_number,
            'email' => $request->email,
            'position' => $request->position,
            'password' => Hash::make('password'),
        ]);

        $user->assignRole($request->role);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users,phone_number,' . $user->id,
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'position' => 'nullable|string|max:255',
        ]);

        $user->update($request->only('name', 'phone_number', 'email', 'position'));

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }
}
