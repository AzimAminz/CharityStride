<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('event_tshirts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('run_category_id')->nullable()->constrained('charity_run_categories')->onDelete('cascade');
            $table->enum('tshirt_type', ['event_tee', 'finisher_tee', 'volunteer_tee']);
            $table->foreignId('size_id')->constrained('tshirt_sizes')->onDelete('cascade');
            $table->integer('quantity_total')->default(0);
            $table->integer('quantity_available')->default(0);
            $table->timestamps();

            $table->unique(['event_id', 'run_category_id', 'tshirt_type', 'size_id'], 'event_tshirts_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('event_tshirts');
    }
};