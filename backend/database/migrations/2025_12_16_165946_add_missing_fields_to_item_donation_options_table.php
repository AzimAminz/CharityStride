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
        Schema::table('item_donation_options', function (Blueprint $table) {
            // Add new fields needed by frontend
            $table->enum('item_category', ['food', 'clothing', 'medical_supplies', 'school_supplies'])->after('event_id');
            $table->string('item_name')->nullable()->change(); // Make nullable since we have category now
            $table->text('item_description')->nullable()->after('item_name');
            $table->enum('quantity_type', ['fixed', 'flexible'])->default('fixed')->after('item_description');
            $table->integer('target_quantity')->nullable()->after('quantity_type');
            $table->string('unit', 50)->nullable()->after('target_quantity');
            
            // Drop old quantity_needed column
            $table->dropColumn('quantity_needed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_donation_options', function (Blueprint $table) {
            // Restore old structure
            $table->integer('quantity_needed')->nullable();
            $table->dropColumn(['item_category', 'item_description', 'quantity_type', 'target_quantity', 'unit']);
            $table->string('item_name')->nullable(false)->change();
        });
    }
};
