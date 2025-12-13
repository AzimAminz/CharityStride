<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('donation_type', ['money', 'item']);
            $table->bigInteger('amount_paid')->nullable(); // For money - in CENTS
            $table->string('item_name')->nullable(); // For items
            $table->integer('quantity')->nullable(); // For items
            $table->timestamp('deleted_at')->nullable(); // Soft delete
            $table->timestamps();
            
            // Indexes
            $table->index(['event_id', 'user_id']);
            $table->index('donation_type');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_registrations');
    }
};
