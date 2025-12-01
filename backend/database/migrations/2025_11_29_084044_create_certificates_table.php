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
            $table->id();
            // Foreign key to Event Registrations table
            $table->foreignId('event_registration_id')->constrained('event_registrations');

            // Certificate details
            $table->string('cert_number', 100)->unique();
            $table->string('participant_name');
            $table->string('event_title');
            $table->string('run_category_name', 100)->nullable();
            $table->timestamp('issued_at')->nullable();

            // Foreign key to Certificate Templates table
            $table->foreignId('cert_template_id')->constrained('cert_templates');

            // Path to the generated certificate file
            $table->string('generated_path')->nullable();
            $table->timestamps();


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
