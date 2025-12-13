<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_role_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique(); // event_crew, registration_counter, etc
            $table->string('name_en', 100);
            $table->string('name_ms', 100);
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_role_types');
    }
};
