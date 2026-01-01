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
            $table->dropForeign(['required_skill_id']);
            $table->dropColumn('required_skill_id');
        });

        Schema::dropIfExists('required_skills');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('required_skills', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name_en', 100);
            $table->string('name_ms', 100);
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('code');
            $table->index('is_active');
        });

        Schema::table('volunteer_roles', function (Blueprint $table) {
            $table->foreignId('required_skill_id')->nullable()->after('role_type_id')->constrained('required_skills');
        });
    }
};
