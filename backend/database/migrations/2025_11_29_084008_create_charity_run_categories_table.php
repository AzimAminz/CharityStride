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
        Schema::create('charity_run_categories', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to Events table
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            
            // Category details
            $table->string('category_name');
            $table->decimal('distance_km', 5, 2)->comment('Distance in kilometers');
            $table->decimal('fee', 10, 2)->default(0);
            $table->integer('capacity')->nullable();
            $table->boolean('includes_event_tee')->default(true);
            $table->boolean('includes_finisher_tee')->default(true);
            
            $table->timestamps();
            
            // Optional: Add unique constraint to prevent duplicate categories per event
            $table->unique(['event_id', 'category_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charity_run_categories');
    }
};
