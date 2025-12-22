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
        Schema::table('volunteer_roles', function (Blueprint $table) {
            $table->dropColumn('total_capacity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteer_roles', function (Blueprint $table) {
            $table->integer('total_capacity')->after('required_skill_id');
        });
    }
};
