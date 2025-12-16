<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('money_donation_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->bigInteger('suggested_amount')->nullable(); // In CENTS (integer for precision), nullable for free amount
            $table->string('description')->nullable();
            $table->timestamps();
            
            // Index
            $table->index('event_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('money_donation_options');
    }
};
