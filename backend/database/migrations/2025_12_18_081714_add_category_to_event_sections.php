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
        Schema::table('event_sections', function (Blueprint $table) {
            $table->enum('category', [
                'overview',
                'participant_details',
                'volunteer_details',
                'donation_details'
            ])->default('overview')->after('event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_sections', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
