<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('volunteer_role_id')->constrained('volunteer_roles');
            $table->foreignId('volunteer_shift_id')->constrained('volunteer_shifts');
            $table->enum('experience_level', ['beginner', 'intermediate', 'experienced'])->nullable();
            $table->text('availability_notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->string('qr_code')->unique()->nullable(); // Auto-generated
            $table->enum('attendance_status', ['pending', 'checked_in', 'absent'])->default('pending');
            $table->timestamp('check_in_time')->nullable();
            $table->timestamp('check_out_time')->nullable();
            $table->decimal('total_hours', 4, 2)->nullable();
            $table->enum('tshirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'])->nullable();
            $table->boolean('tshirt_collected')->default(false);
            $table->timestamp('tshirt_collected_at')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users');
            $table->timestamp('deleted_at')->nullable(); // Soft delete
            $table->timestamps();
            
            // Indexes
            $table->index('qr_code');
            $table->index(['user_id', 'event_id', 'status']);
            $table->index(['volunteer_role_id', 'status']);
            $table->index(['volunteer_shift_id', 'status']);
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_registrations');
    }
};
