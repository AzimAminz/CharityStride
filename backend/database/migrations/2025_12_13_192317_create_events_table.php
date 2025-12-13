<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ngo_id')->constrained('ngos');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_published')->default(false);
            $table->boolean('has_volunteer')->default(false); // Auto-set by trigger
            $table->boolean('has_donation')->default(false); // Auto-set by trigger
            $table->boolean('has_participant')->default(false); // Auto-set by trigger
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
            
            // Composite index for event listing
            $table->index(['ngo_id', 'is_published', 'start_date']);
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
