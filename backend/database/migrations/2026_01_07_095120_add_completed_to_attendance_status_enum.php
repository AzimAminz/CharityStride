<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add completed to the enum for attendance_status in volunteer_registrations
        DB::statement("ALTER TABLE volunteer_registrations MODIFY COLUMN attendance_status ENUM('pending', 'checked_in', 'absent', 'completed') DEFAULT 'pending'");
        
        // Also add to participant_registrations for consistency
        DB::statement("ALTER TABLE participant_registrations MODIFY COLUMN attendance_status ENUM('pending', 'checked_in', 'absent', 'completed') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE volunteer_registrations MODIFY COLUMN attendance_status ENUM('pending', 'checked_in', 'absent') DEFAULT 'pending'");
        DB::statement("ALTER TABLE participant_registrations MODIFY COLUMN attendance_status ENUM('pending', 'checked_in', 'absent') DEFAULT 'pending'");
    }
};
