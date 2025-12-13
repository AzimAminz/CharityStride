<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('volunteer_role_id')->constrained('volunteer_roles');
            $table->date('shift_date');
            $table->foreignId('shift_type_id')->constrained('shift_types'); // FK to lookup table
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('capacity')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('volunteer_role_id');
            $table->index('shift_type_id');
            $table->index('shift_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_shifts');
    }
};
