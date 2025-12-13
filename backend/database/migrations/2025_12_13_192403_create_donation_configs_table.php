<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained('events'); // One-to-one
            $table->boolean('accepts_money')->default(false);
            $table->boolean('accepts_items')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_configs');
    }
};
