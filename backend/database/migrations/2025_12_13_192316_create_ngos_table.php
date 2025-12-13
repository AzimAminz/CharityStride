<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ngos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users');
            $table->string('name', 255);
            $table->string('registration_no', 100);
            $table->string('registration_type', 50)->nullable();
            $table->string('category', 100)->nullable();
            $table->date('established_date')->nullable();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postcode', 10)->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_no', 50)->nullable();
            $table->string('bank_account_name', 255)->nullable();
            $table->string('registration_doc_url', 255)->nullable();
            $table->string('logo_url', 255)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'blocked'])->default('pending');
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ngos');
    }
};
