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
        Schema::create('food_donation', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to Events table (One-to-one relationship)
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            
            // Food details
            $table->string('food_type');
            $table->integer('quantity');
            $table->enum('unit', ['kg', 'portion', 'box', 'packet', 'unit']);
            
            // Contact information
            $table->string('contact_person');
            $table->string('contact_phone', 30);
            $table->decimal('fee', 10, 2)->default(0);
            
            $table->timestamps();
            
            // One-to-one relationship: one event can only have one food rescue record
            $table->unique(['event_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_rescues');
    }
};
