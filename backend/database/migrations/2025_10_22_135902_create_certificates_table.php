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
        Schema::create('certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // Foreign key to Event Registrations table
            $table->uuid('registration_id');

            // Certificate details
            $table->string('cert_number', 100)->unique();
            $table->string('participant_name');
            $table->string('event_title');
            $table->timestamp('issued_at')->nullable();

            // Foreign key to Certificate Templates table
            $table->uuid('template_id')->nullable();

            // Path to the generated certificate file
            $table->string('generated_path')->nullable();
            $table->timestamps();

            $table->foreign('registration_id')->references('id')->on('event_registrations')->cascadeOnDelete();
            $table->foreign('template_id')->references('id')->on('cert_templates')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
