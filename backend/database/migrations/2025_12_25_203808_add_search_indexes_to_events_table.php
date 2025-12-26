<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add city field if it doesn't exist
            if (!Schema::hasColumn('events', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            
            // Add state field if it doesn't exist
            if (!Schema::hasColumn('events', 'state')) {
                $table->string('state')->nullable()->after('city');
            }
            
            // Add published_at timestamp for sorting by publish date
            if (!Schema::hasColumn('events', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('is_published');
            }
            
            // Add registration count for popularity sorting
            if (!Schema::hasColumn('events', 'registration_count')) {
                $table->integer('registration_count')->default(0)->after('published_at');
            }
        });
        
        // Add indexes for performance
        Schema::table('events', function (Blueprint $table) {
            // Check if indexes don't exist before creating
            $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_published_open'");
            if (empty($indexes)) {
                $table->index(['is_published', 'end_date'], 'idx_published_open');
            }
            
            $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_location'");
            if (empty($indexes)) {
                $table->index(['latitude', 'longitude'], 'idx_location');
            }
            
            $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_created'");
            if (empty($indexes)) {
                $table->index('created_at', 'idx_created');
            }
            
            $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_published'");
            if (empty($indexes)) {
                $table->index('published_at', 'idx_published');
            }
            
            $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_popularity'");
            if (empty($indexes)) {
                $table->index('registration_count', 'idx_popularity');
            }
        });
        
        // Add full-text search index for title, description, address
        $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_search'");
        if (empty($indexes)) {
            DB::statement('ALTER TABLE events ADD FULLTEXT INDEX idx_search (title, description, address)');
        }
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Drop full-text index first
            if (Schema::hasColumn('events', 'title')) {
                $indexes = DB::select("SHOW INDEX FROM events WHERE Key_name = 'idx_search'");
                if (!empty($indexes)) {
                    $table->dropIndex('idx_search');
                }
            }
            
            // Drop regular indexes
            $table->dropIndex('idx_published_open');
            $table->dropIndex('idx_location');
            $table->dropIndex('idx_created');
            $table->dropIndex('idx_published');
            $table->dropIndex('idx_popularity');
            
            // Drop columns
            if (Schema::hasColumn('events', 'city')) {
                $table->dropColumn('city');
            }
            if (Schema::hasColumn('events', 'state')) {
                $table->dropColumn('state');
            }
            if (Schema::hasColumn('events', 'published_at')) {
                $table->dropColumn('published_at');
            }
            if (Schema::hasColumn('events', 'registration_count')) {
                $table->dropColumn('registration_count');
            }
        });
    }
};
