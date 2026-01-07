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
        Schema::table('volunteer_registrations', function (Blueprint $table) {
            $table->decimal('total_hours', 8, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteer_registrations', function (Blueprint $table) {
            $table->decimal('total_hours', 4, 2)->nullable()->change();
        });
    }
};
