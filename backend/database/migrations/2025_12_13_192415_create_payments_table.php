<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // Polymorphic columns
            $table->string('payable_type'); // ParticipantRegistration, DonationRegistration, VolunteerRegistration
            $table->unsignedBigInteger('payable_id');
            $table->foreignId('user_id')->constrained('users');
            $table->bigInteger('amount'); // In CENTS - exact precision
            $table->string('currency', 3)->default('MYR'); // ISO 4217
            $table->enum('payment_method', ['card', 'fpx', 'online_banking', 'manual'])->nullable();
            $table->enum('payment_status', ['pending', 'processing', 'paid', 'failed', 'refunded'])->default('pending');
            $table->string('payment_reference')->nullable();
            $table->string('payment_gateway')->nullable(); // stripe, paypal, billplz
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->bigInteger('refund_amount')->nullable(); // In CENTS
            $table->text('refund_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('deleted_at')->nullable(); // Soft delete
            $table->timestamps();
            
            // Indexes
            $table->index(['payable_type', 'payable_id']);
            $table->index('payment_reference');
            $table->index(['payment_status', 'created_at']);
            $table->index('user_id');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
