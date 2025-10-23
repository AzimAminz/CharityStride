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
        Schema::create('event_shifts', function (Blueprint $table) {
            $table->id();

            // Foreign key to Events table
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();

            // Shift details
            $table->date('shift_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('capacity')->default(0);
            $table->timestamps();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_shifts');
    }
};
