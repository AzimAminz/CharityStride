<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ngo_id')->constrained('ngos');
            $table->string('name');
            $table->string('address');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index
            $table->index('ngo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_locations');
    }
};
