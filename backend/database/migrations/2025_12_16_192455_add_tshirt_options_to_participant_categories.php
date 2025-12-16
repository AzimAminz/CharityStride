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
            // Add t-shirt type options
            $table->boolean('has_event_tshirt')->default(false)->after('description');
            $table->boolean('has_finisher_tshirt')->default(false)->after('has_event_tshirt');
            
            // Drop old generic tshirt fields if they exist
            $table->dropColumn(['has_tshirt', 'tshirt_description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participant_categories', function (Blueprint $table) {
            // Restore old fields
            $table->boolean('has_tshirt')->default(false);
            $table->text('tshirt_description')->nullable();
            
            // Remove new fields
            $table->dropColumn(['has_event_tshirt', 'has_finisher_tshirt']);
        });
    }
};
