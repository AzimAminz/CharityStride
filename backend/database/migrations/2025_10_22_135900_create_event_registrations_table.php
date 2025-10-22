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
            $table->uuid('id')->primary();
            
            // Foreign key to Events table
            $table->uuid('event_id');

            // Optional foreign key to Event Shifts table
            $table->uuid('shift_id')->nullable();

            // User details
            $table->uuid('user_id');

            // Registration details
            $table->enum('status', ['pending', 'accepted', 'rejected', 'confirmed', 'completed'])->default('pending');
            $table->string('qr_code')->nullable();
            $table->boolean('attendance_marked')->default(false);
            $table->integer('points_earned')->default(0);
            $table->timestamps();

            $table->foreign('event_id')->references('id')->on('events')->cascadeOnDelete();
            $table->foreign('shift_id')->references('id')->on('event_shifts')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
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
