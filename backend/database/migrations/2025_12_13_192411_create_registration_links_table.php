<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->enum('module_type', ['volunteer', 'donation', 'participant']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Composite index
            $table->index(['event_id', 'module_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_links');
    }
};
