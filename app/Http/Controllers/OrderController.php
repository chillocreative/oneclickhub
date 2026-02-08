<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\Order;
use App\Models\Review;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'agreed_price' => 'required|numeric|min:0',
            'customer_notes' => 'nullable|string|max:1000',
        ]);

        $service = Service::findOrFail($validated['service_id']);

        $exists = Order::where('freelancer_id', $service->user_id)
            ->where('booking_date', $validated['booking_date'])
            ->whereNotIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])
            ->exists();

        if ($exists) {
            return back()->with('error', 'This date is already booked.');
        }

        $order = Order::create([
            'customer_id' => auth()->id(),
            'freelancer_id' => $service->user_id,
            'service_id' => $service->id,
            'booking_date' => $validated['booking_date'],
            'agreed_price' => $validated['agreed_price'],
            'customer_notes' => $validated['customer_notes'] ?? null,
            'status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        return redirect()->route('orders.show', $order)->with('success', 'Order created! Please upload your payment slip.');
    }

    public function show(Order $order)
    {
        $user = auth()->user();
        if ($order->customer_id !== $user->id && $order->freelancer_id !== $user->id && !$user->hasRole('Admin')) {
            abort(403);
        }

        $order->load(['customer', 'freelancer', 'freelancer.bankingDetail', 'service', 'review']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'isFreelancer' => $order->freelancer_id === $user->id,
            'isCustomer' => $order->customer_id === $user->id,
        ]);
    }

    public function uploadSlip(Request $request, Order $order)
    {
        if ($order->customer_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== Order::STATUS_PENDING_PAYMENT) {
            return back()->with('error', 'Payment slip can only be uploaded for pending payment orders.');
        }

        $request->validate([
            'payment_slip' => 'required|image|max:5120',
        ]);

        if ($order->payment_slip) {
            Storage::disk('public')->delete($order->payment_slip);
        }

        $path = $request->file('payment_slip')->store('payment-slips', 'public');

        $order->update([
            'payment_slip' => $path,
            'payment_slip_uploaded_at' => now(),
            'status' => Order::STATUS_PENDING_APPROVAL,
        ]);

        return back()->with('success', 'Payment slip uploaded. Waiting for freelancer approval.');
    }

    public function accept(Order $order)
    {
        if ($order->freelancer_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== Order::STATUS_PENDING_APPROVAL) {
            return back()->with('error', 'This order cannot be accepted.');
        }

        $order->update([
            'status' => Order::STATUS_ACTIVE,
            'freelancer_responded_at' => now(),
        ]);

        // Create order chat conversation
        $userIds = collect([auth()->id(), $order->customer_id])->sort()->values();
        ChatConversation::firstOrCreate([
            'user_one_id' => $userIds[0],
            'user_two_id' => $userIds[1],
            'order_id' => $order->id,
        ], [
            'type' => 'order',
            'last_message_at' => now(),
        ]);

        return back()->with('success', 'Order accepted! You can now chat with the customer.');
    }

    public function reject(Request $request, Order $order)
    {
        if ($order->freelancer_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== Order::STATUS_PENDING_APPROVAL) {
            return back()->with('error', 'This order cannot be rejected.');
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $order->update([
            'status' => Order::STATUS_REJECTED,
            'freelancer_responded_at' => now(),
            'cancellation_reason' => $request->reason,
        ]);

        return back()->with('success', 'Order rejected.');
    }

    public function deliver(Order $order)
    {
        if ($order->freelancer_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== Order::STATUS_ACTIVE) {
            return back()->with('error', 'Only active orders can be delivered.');
        }

        $order->update([
            'status' => Order::STATUS_DELIVERED,
            'delivered_at' => now(),
        ]);

        return back()->with('success', 'Order marked as delivered! Waiting for customer confirmation.');
    }

    public function complete(Request $request, Order $order)
    {
        if ($order->customer_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== Order::STATUS_DELIVERED) {
            return back()->with('error', 'Only delivered orders can be completed.');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $order->update([
            'status' => Order::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        Review::create([
            'order_id' => $order->id,
            'customer_id' => auth()->id(),
            'freelancer_id' => $order->freelancer_id,
            'service_id' => $order->service_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Order completed! Thank you for your review.');
    }

    public function freelancerOrders(Request $request)
    {
        $query = Order::where('freelancer_id', auth()->id())
            ->with(['customer', 'service'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Orders/FreelancerIndex', [
            'orders' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only('status'),
        ]);
    }

    public function customerOrders(Request $request)
    {
        $query = Order::where('customer_id', auth()->id())
            ->with(['freelancer', 'service'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Orders/CustomerIndex', [
            'orders' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only('status'),
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = Order::with(['customer', 'freelancer', 'service'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('freelancer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        $stats = [
            'total' => Order::count(),
            'pending' => Order::whereIn('status', [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING_APPROVAL])->count(),
            'active' => Order::where('status', Order::STATUS_ACTIVE)->count(),
            'completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
            'cancelled' => Order::whereIn('status', [Order::STATUS_CANCELLED, Order::STATUS_REJECTED])->count(),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
            'stats' => $stats,
        ]);
    }

    public function adminShow(Order $order)
    {
        $order->load(['customer', 'freelancer', 'freelancer.bankingDetail', 'service', 'review', 'conversation.messages.sender']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function adminUpdate(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending_payment,pending_approval,active,delivered,completed,cancelled,rejected',
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === Order::STATUS_CANCELLED) {
            $data['cancelled_at'] = now();
            $data['cancellation_reason'] = $validated['cancellation_reason'] ?? 'Cancelled by admin';
        } elseif ($validated['status'] === Order::STATUS_COMPLETED) {
            $data['completed_at'] = now();
        } elseif ($validated['status'] === Order::STATUS_DELIVERED) {
            $data['delivered_at'] = now();
        } elseif ($validated['status'] === Order::STATUS_ACTIVE) {
            $data['freelancer_responded_at'] = now();
        }

        $order->update($data);

        return back()->with('success', 'Order status updated.');
    }

    public function adminDestroy(Order $order)
    {
        if ($order->payment_slip) {
            Storage::disk('public')->delete($order->payment_slip);
        }

        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', 'Order deleted.');
    }
}
