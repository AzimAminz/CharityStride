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
        Schema::table('participant_categories', function (Blueprint $table) {
            // Add event date and time for this category
            $table->date('event_date')->nullable()->after('category_name');
            $table->time('event_time')->nullable()->after('event_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participant_categories', function (Blueprint $table) {
            $table->dropColumn(['event_date', 'event_time']);
        });
    }
};
