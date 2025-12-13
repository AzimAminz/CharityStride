<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participant_fee_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_category_id')->constrained('participant_categories');
            $table->string('tier_name'); // Early Bird, Regular, Late
            $table->bigInteger('amount'); // In CENTS
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('participant_category_id');
            $table->index(['starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participant_fee_tiers');
    }
};
