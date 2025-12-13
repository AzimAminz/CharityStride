<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participant_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('category_type_id')->constrained('participant_category_types'); // FK to lookup
            $table->string('custom_category_name')->nullable();
            $table->integer('capacity')->nullable();
            $table->boolean('has_fee')->default(false);
            $table->enum('fee_type', ['fixed', 'tiered'])->nullable();
            $table->bigInteger('base_fee')->nullable(); // In CENTS
            $table->text('description')->nullable();
            $table->boolean('has_tshirt')->default(false);
            $table->text('tshirt_description')->nullable();
            $table->integer('version')->default(0); // Optimistic locking
            $table->timestamps();
            
            // Indexes
            $table->index('event_id');
            $table->index('category_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_categories');
    }
};
