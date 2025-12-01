<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tshirt_collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_tshirt_id')->constrained('participant_tshirts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('collection_point');
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->text('address')->nullable();
            $table->enum('collection_method', ['onsite', 'delivery', 'pickup']);
            $table->text('delivery_address')->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->enum('status', ['ready', 'collected', 'delivered', 'cancelled'])->default('ready');
            $table->timestamp('collected_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tshirt_collections');
    }
};