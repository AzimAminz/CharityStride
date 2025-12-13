<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participant_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('participant_category_id')->constrained('participant_categories');
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('preferred_session')->nullable();
            $table->text('special_requirements')->nullable();
            $table->foreignId('fee_tier_id')->nullable()->constrained('participant_fee_tiers');
            $table->bigInteger('amount_paid')->default(0); // In CENTS
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->string('bib_number')->unique()->nullable();
            $table->string('qr_code')->unique()->nullable(); // Auto-generated
            $table->enum('attendance_status', ['pending', 'checked_in', 'absent'])->default('pending');
            $table->timestamp('check_in_time')->nullable();
            $table->enum('tshirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'])->nullable();
            $table->boolean('tshirt_collected')->default(false);
            $table->timestamp('tshirt_collected_at')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users');
            $table->timestamp('deleted_at')->nullable(); // Soft delete
            $table->timestamps();
            
            // Indexes
            $table->index('qr_code');
            $table->index('bib_number');
            $table->index(['user_id', 'event_id', 'status']);
            $table->index(['participant_category_id', 'status']);
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_registrations');
    }
};
