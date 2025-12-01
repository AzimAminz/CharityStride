<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tshirt_sizes', function (Blueprint $table) {
            $table->id();
            $table->string('size_code', 10)->unique();
            $table->string('size_name', 50);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tshirt_sizes');
    }
};