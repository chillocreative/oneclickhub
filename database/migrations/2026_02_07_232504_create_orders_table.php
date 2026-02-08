<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->date('booking_date');
            $table->decimal('agreed_price', 10, 2);
            $table->text('customer_notes')->nullable();
            $table->string('payment_slip')->nullable();
            $table->enum('status', [
                'pending_payment',
                'pending_approval',
                'active',
                'delivered',
                'completed',
                'cancelled',
                'rejected',
            ])->default('pending_payment');
            $table->timestamp('payment_slip_uploaded_at')->nullable();
            $table->timestamp('freelancer_responded_at')->nullable();
            $table->timestamp('delivery_deadline_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['freelancer_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->unique(['freelancer_id', 'booking_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
