<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_constraints', function (Blueprint $table) {
            $table->foreignId('certificate_id')->primary()->constrained('certificates');
            $table->foreignId('participant_registration_id')->nullable()->constrained('participant_registrations');
            $table->foreignId('volunteer_registration_id')->nullable()->constrained('volunteer_registrations');
            
            // Indexes
            $table->index('participant_registration_id');
            $table->index('volunteer_registration_id');
        });
        
        // Add CHECK constraint
        DB::statement('ALTER TABLE certificate_constraints ADD CONSTRAINT chk_cert_exactly_one CHECK (
            (participant_registration_id IS NOT NULL AND volunteer_registration_id IS NULL) OR
            (participant_registration_id IS NULL AND volunteer_registration_id IS NOT NULL)
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_constraints');
    }
};
