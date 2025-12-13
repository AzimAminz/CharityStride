<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('role_type_id')->constrained('volunteer_role_types'); // FK to lookup table
            $table->string('custom_role_name')->nullable();
            $table->foreignId('required_skill_id')->nullable()->constrained('required_skills');
            $table->text('role_description')->nullable();
            $table->integer('total_capacity')->nullable();
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('location_details')->nullable();
            $table->boolean('has_tshirt')->default(false);
            $table->text('tshirt_description')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('event_id');
            $table->index('role_type_id');
            $table->index('required_skill_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_roles');
    }
};
