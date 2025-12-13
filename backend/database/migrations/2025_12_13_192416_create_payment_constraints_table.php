<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_constraints', function (Blueprint $table) {
            $table->foreignId('payment_id')->primary()->constrained('payments');
            $table->foreignId('participant_registration_id')->nullable()->constrained('participant_registrations');
            $table->foreignId('donation_registration_id')->nullable()->constrained('donation_registrations');
            $table->foreignId('volunteer_registration_id')->nullable()->constrained('volunteer_registrations');
            
            // Indexes
            $table->index('participant_registration_id');
            $table->index('donation_registration_id');
            $table->index('volunteer_registration_id');
        });
        
        // Add CHECK constraint (MySQL 8.0.16+)
        DB::statement('ALTER TABLE payment_constraints ADD CONSTRAINT chk_payment_exactly_one CHECK (
            (participant_registration_id IS NOT NULL AND donation_registration_id IS NULL AND volunteer_registration_id IS NULL) OR
            (participant_registration_id IS NULL AND donation_registration_id IS NOT NULL AND volunteer_registration_id IS NULL) OR
            (participant_registration_id IS NULL AND donation_registration_id IS NULL AND volunteer_registration_id IS NOT NULL)
        )');
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_constraints');
    }
};
