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
            // Add custom category name field (free text input)
            $table->string('category_name')->after('event_id');
            
            // Add capacity type enum
            $table->enum('capacity_type', ['unlimited', 'limited'])->default('limited')->after('category_name');
            
            // Make capacity nullable for unlimited types
            $table->integer('capacity')->nullable()->change();
            
            // Add location fields
            $table->enum('location_type', ['event_location', 'custom'])->default('event_location')->after('description');
            $table->string('location_name')->nullable()->after('location_type');
            $table->decimal('latitude', 10, 8)->nullable()->after('location_name');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->text('location_details')->nullable()->after('longitude');
            
            // Drop old foreign key and column
            $table->dropForeign(['category_type_id']);
            $table->dropColumn('category_type_id');
            $table->dropColumn('custom_category_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participant_categories', function (Blueprint $table) {
            // Restore old structure
            $table->foreignId('category_type_id')->after('event_id')->constrained('participant_category_types');
            $table->string('custom_category_name')->nullable()->after('category_type_id');
            
            // Remove new fields
            $table->dropColumn([
                'category_name',
                'capacity_type',
                'location_type',
                'location_name',
                'latitude',
                'longitude',
                'location_details'
            ]);
            
            // Make capacity not nullable again
            $table->integer('capacity')->nullable(false)->change();
        });
    }
};
