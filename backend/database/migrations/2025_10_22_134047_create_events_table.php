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
        Schema::create('events', function (Blueprint $table) {
            // Primary key
            $table->id();   

            // Foreign key to NGOs table
            $table->foreignId('ngo_id')->constrained('ngos')->cascadeOnDelete();

            // Event details
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['volunteer', 'food_donation', 'charity_run']);
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('capacity')->nullable();

            // Status and timestamps
            $table->enum('status', ['open', 'closed', 'completed'])->default('open');
            $table->boolean('has_tshirt')->default(false);
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
