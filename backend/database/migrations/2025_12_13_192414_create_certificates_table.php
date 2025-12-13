<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            // Polymorphic columns
            $table->string('registerable_type'); // ParticipantRegistration, VolunteerRegistration
            $table->unsignedBigInteger('registerable_id');
            $table->string('cert_number', 100)->unique();
            $table->string('participant_name');
            $table->string('event_title');
            $table->timestamp('issued_at')->nullable();
            $table->foreignId('cert_template_id')->nullable()->constrained('cert_templates');
            $table->string('generated_path')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['registerable_type', 'registerable_id']);
            $table->index('cert_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
