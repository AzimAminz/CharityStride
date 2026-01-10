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
        Schema::table('participant_registrations', function (Blueprint $table) {
            // Drop the global unique constraint
            $table->dropUnique(['bib_number']);
            
            // Add composite unique constraint scoped to event
            $table->unique(['event_id', 'bib_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participant_registrations', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'bib_number']);
            $table->unique('bib_number');
        });
    }
};
