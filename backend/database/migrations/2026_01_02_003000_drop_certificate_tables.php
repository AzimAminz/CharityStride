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
        Schema::dropIfExists('certificate_constraints');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('cert_templates');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('cert_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ngo_id')->constrained('ngos');
            $table->string('template_name');
            $table->string('background_image_url')->nullable();
            $table->string('font_family')->nullable();
            $table->integer('font_size')->nullable();
            $table->string('font_color')->nullable();
            $table->json('layout_data')->nullable();
            $table->timestamps();
            $table->index('ngo_id');
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->string('registerable_type');
            $table->unsignedBigInteger('registerable_id');
            $table->string('cert_number', 100)->unique();
            $table->string('participant_name');
            $table->string('event_title');
            $table->timestamp('issued_at')->nullable();
            $table->foreignId('cert_template_id')->nullable()->constrained('cert_templates');
            $table->string('generated_path')->nullable();
            $table->timestamps();
            $table->index(['registerable_type', 'registerable_id']);
            $table->index('cert_number');
        });

        Schema::create('certificate_constraints', function (Blueprint $table) {
            $table->foreignId('certificate_id')->primary()->constrained('certificates');
            $table->foreignId('participant_registration_id')->nullable()->constrained('participant_registrations');
            $table->foreignId('volunteer_registration_id')->nullable()->constrained('volunteer_registrations');
            $table->index('participant_registration_id');
            $table->index('volunteer_registration_id');
        });
    }
};
