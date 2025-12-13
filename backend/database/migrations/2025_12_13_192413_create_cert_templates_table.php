<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cert_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ngo_id')->constrained('ngos');
            $table->string('template_name');
            $table->string('background_image_url')->nullable();
            $table->string('font_family')->nullable();
            $table->integer('font_size')->nullable();
            $table->string('font_color')->nullable();
            $table->json('layout_data')->nullable();
            $table->timestamps();
            
            // Index
            $table->index('ngo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cert_templates');
    }
};
