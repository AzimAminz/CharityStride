<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('participant_tshirts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained('event_registrations')->onDelete('cascade');
            $table->foreignId('run_category_id')->nullable()->constrained('charity_run_categories')->onDelete('set null');
            $table->enum('tshirt_type', ['event_tee', 'finisher_tee', 'volunteer_tee']);
            $table->foreignId('size_id')->constrained('tshirt_sizes')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->enum('status', ['pending', 'confirmed', 'out_of_stock', 'collected'])->default('pending');
            $table->string('pickup_code', 50)->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['registration_id', 'tshirt_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('participant_tshirts');
    }
};