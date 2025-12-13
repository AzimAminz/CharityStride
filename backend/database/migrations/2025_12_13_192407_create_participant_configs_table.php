<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participant_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained('events'); // One-to-one
            $table->boolean('has_categories')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_configs');
    }
};
