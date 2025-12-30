<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('participant_categories', function (Blueprint $table) {
            $table->integer('current_registrations')->default(0)->after('capacity');
        });
    }

    public function down(): void
    {
        Schema::table('participant_categories', function (Blueprint $table) {
            $table->dropColumn('current_registrations');
        });
    }
};
