<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('shift_id')->nullable()->constrained('event_shifts'); 
            $table->foreignId('run_category_id')->nullable()->constrained('charity_run_categories'); 
            $table->foreignId('user_id')->constrained('users');

            // Registration details
            $table->enum('status', ['pending', 'accepted', 'rejected', 'confirmed', 'completed'])->default('pending');
            $table->string('qr_code')->nullable();
            $table->boolean('attendance_marked')->default(false);
            
            // ✅ NEW: Attendance tracking fields
            $table->timestamp('check_in_time')->nullable();
            $table->timestamp('check_out_time')->nullable();
            $table->decimal('total_hours', 4, 2)->nullable()->comment('Calculated hours between check-in and check-out');
            $table->boolean('finisher_qualified')->default(false);     
            $table->boolean('tshirt_selection_completed')->default(false); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
    }
};
