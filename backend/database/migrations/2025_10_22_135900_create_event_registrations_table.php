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
            
            // Foreign key to Events table
            $table->foreignId('event_id')->constrained('events');

            // Optional foreign key to Event Shifts table
            $table->foreignId('event_shift_id')->nullable()->constrained('event_shifts');

            // User details
            $table->foreignId('user_id')->constrained('users');

            // Registration details
            $table->enum('status', ['pending', 'accepted', 'rejected', 'confirmed', 'completed'])->default('pending');
            $table->string('qr_code')->nullable();
            $table->boolean('attendance_marked')->default(false);
            $table->integer('points_earned')->default(0);
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
