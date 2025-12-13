<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('google_id')->unique()->nullable();
            $table->enum('role', ['admin', 'ngo', 'user'])->default('user');
            $table->boolean('status')->default(true);
            $table->string('phone', 30)->nullable();
            $table->date('birthdate')->nullable();
            $table->string('photo')->nullable();
            $table->timestamp('deleted_at')->nullable(); // Soft delete
            $table->timestamps();
            
            // Indexes
            $table->index('email');
            $table->index('google_id');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
