<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\OrderResource;
use App\Models\ChatConversation;
use App\Models\Order;
use App\Models\Review;
use App\Models\Service;
use App\Services\FcmService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    use ApiResponse;

    public function store(Request $request): JsonResponse
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
            return $this->error('This date is already booked.', 422);
        }

        $order = Order::create([
            'customer_id' => $request->user()->id,
            'freelancer_id' => $service->user_id,
            'service_id' => $service->id,
            'booking_date' => $validated['booking_date'],
            'agreed_price' => $validated['agreed_price'],
            'customer_notes' => $validated['customer_notes'] ?? null,
            'status' => Order::STATUS_PENDING_PAYMENT,
        ]);

        // Open the booking-scoped chat immediately so the customer is dropped
        // straight into a private channel after confirming the date.
        $userIds = collect([$request->user()->id, $service->user_id])->sort()->values();
        $conversation = ChatConversation::firstOrCreate([
            'user_one_id' => $userIds[0],
            'user_two_id' => $userIds[1],
            'order_id' => $order->id,
        ], [
            'type' => 'order',
            'service_id' => $service->id,
            'last_message_at' => now(),
        ]);

        $this->notifyUser(
            $service->user_id,
            'New booking received',
            ($request->user()->name ?: 'A customer') . ' booked "' . $service->title . '" — open the order to review.',
            ['type' => 'order', 'event' => 'booking.created', 'order_id' => $order->id]
        );

        return $this->success(
            [
                'order' => new OrderResource($order->load(['customer', 'freelancer', 'service'])),
                'conversation_id' => $conversation->id,
            ],
            'Booking confirmed. You can now chat with the freelancer.',
            201
        );
    }

    public function show(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($order->customer_id !== $user->id && $order->freelancer_id !== $user->id && !$user->hasRole('Admin')) {
            return $this->forbidden();
        }

        $order->load(['customer', 'freelancer', 'freelancer.bankingDetail', 'service', 'review']);

        $conversation = ChatConversation::where('order_id', $order->id)->first();

        return $this->success([
            'order' => new OrderResource($order),
            'conversation_id' => $conversation?->id,
        ]);
    }

    public function uploadSlip(Request $request, Order $order): JsonResponse
    {
        if ($order->customer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        if ($order->status !== Order::STATUS_PENDING_PAYMENT) {
            return $this->error('Payment slip can only be uploaded for pending payment orders.', 422);
        }

        $request->validate([
            'payment_slip' => 'required|image|max:25600',
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

        return $this->success(
            new OrderResource($order->fresh()->load(['customer', 'freelancer', 'service'])),
            'Payment slip uploaded. Waiting for freelancer approval.'
        );
    }

    public function accept(Order $order, Request $request): JsonResponse
    {
        if ($order->freelancer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        // Either the customer uploaded a slip and we're at pending_approval,
        // or the new chat-receipt flow is in use and we're still at pending_payment.
        if (!in_array($order->status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING_APPROVAL], true)) {
            return $this->error('This order cannot be accepted.', 422);
        }

        $order->update([
            'status' => Order::STATUS_ACTIVE,
            'freelancer_responded_at' => now(),
        ]);

        // Backfill chat in case it predates the new auto-create flow.
        $userIds = collect([$request->user()->id, $order->customer_id])->sort()->values();
        ChatConversation::firstOrCreate([
            'user_one_id' => $userIds[0],
            'user_two_id' => $userIds[1],
            'order_id' => $order->id,
        ], [
            'type' => 'order',
            'service_id' => $order->service_id,
            'last_message_at' => now(),
        ]);

        $this->notifyUser(
            $order->customer_id,
            'Booking accepted',
            'Your booking is marked as Service Paid. The freelancer is starting work.',
            ['type' => 'order', 'event' => 'booking.accepted', 'order_id' => $order->id]
        );

        return $this->success(
            new OrderResource($order->fresh()->load(['customer', 'freelancer', 'service'])),
            'Order accepted.'
        );
    }

    public function reject(Request $request, Order $order): JsonResponse
    {
        if ($order->freelancer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        if (!in_array($order->status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PENDING_APPROVAL], true)) {
            return $this->error('This order cannot be rejected.', 422);
        }

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $order->update([
            'status' => Order::STATUS_REJECTED,
            'freelancer_responded_at' => now(),
            'cancellation_reason' => $request->reason,
        ]);

        $this->notifyUser(
            $order->customer_id,
            'Booking rejected',
            $request->reason ?: 'The freelancer rejected your booking.',
            ['type' => 'order', 'event' => 'booking.rejected', 'order_id' => $order->id]
        );

        return $this->success(
            new OrderResource($order->fresh()->load(['customer', 'freelancer', 'service'])),
            'Order rejected.'
        );
    }

    public function deliver(Order $order, Request $request): JsonResponse
    {
        if ($order->freelancer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        if ($order->status !== Order::STATUS_ACTIVE) {
            return $this->error('Only active orders can be delivered.', 422);
        }

        $order->update([
            'status' => Order::STATUS_DELIVERED,
            'delivered_at' => now(),
        ]);

        $this->notifyUser(
            $order->customer_id,
            'Service delivered',
            'The freelancer marked your booking as delivered. Confirm completion to leave a review.',
            ['type' => 'order', 'event' => 'booking.delivered', 'order_id' => $order->id]
        );

        return $this->success(
            new OrderResource($order->fresh()->load(['customer', 'freelancer', 'service'])),
            'Order marked as delivered.'
        );
    }

    public function complete(Request $request, Order $order): JsonResponse
    {
        if ($order->customer_id !== $request->user()->id) {
            return $this->forbidden();
        }

        if ($order->status !== Order::STATUS_DELIVERED) {
            return $this->error('Only delivered orders can be completed.', 422);
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
            'customer_id' => $request->user()->id,
            'freelancer_id' => $order->freelancer_id,
            'service_id' => $order->service_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $this->notifyUser(
            $order->freelancer_id,
            'Booking completed',
            ($request->user()->name ?: 'The customer') . ' confirmed completion and left a review.',
            ['type' => 'order', 'event' => 'booking.completed', 'order_id' => $order->id]
        );

        return $this->success(
            new OrderResource($order->fresh()->load(['customer', 'freelancer', 'service', 'review'])),
            'Order completed. Thank you for your review.'
        );
    }

    public function freelancerOrders(Request $request): JsonResponse
    {
        $query = Order::where('freelancer_id', $request->user()->id)
            ->with(['customer', 'service'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->paginatedResource(
            $query->paginate($request->input('per_page', 12)),
            OrderResource::class
        );
    }

    public function customerOrders(Request $request): JsonResponse
    {
        $query = Order::where('customer_id', $request->user()->id)
            ->with(['freelancer', 'service'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->paginatedResource(
            $query->paginate($request->input('per_page', 12)),
            OrderResource::class
        );
    }

    /**
     * Best-effort FCM dispatch. Push delivery must never block the API response.
     */
    private function notifyUser(int $userId, string $title, string $body, array $data = []): void
    {
        try {
            app(FcmService::class)->sendToUser($userId, $title, $body, $data);
        } catch (\Throwable $e) {
            \Log::warning('Order FCM send failed', ['error' => $e->getMessage()]);
        }
    }
}
