<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ngos', function (Blueprint $table) {
            $table->id();

            // Relationship to users table
            // Foreign key constraint
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();

            //Basic Information
            $table->string('name',255); //Official NGO name
            $table->string('registration_number',100)->nullable();  // SSM / ROS number
            $table->string('regsitration_type',50)->nullable(); // SSM / ROS / NGO / Others
            $table->string('category',100)->nullable();  // Welfare / Education / Environment
            $table->date('established_date')->nullable(); // Official formation date
            $table->text('description')->nullable();  // Description / mission statement

            // Address info
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postcode', 10)->nullable();
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();

            // Contact info
            $table->string('contact_email', 255)->nullable();
            $table->string('contact_phone', 30)->nullable();

            // Banking info
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_no', 50)->nullable();
            $table->string('bank_account_name', 255)->nullable();

            // Files and media
            $table->string('registration_doc_url', 255)->nullable();  // Registration certificate file
            $table->string('logo_url', 255)->nullable();              // NGO logo

            // Status 
            $table->boolean('status')->default(true); // Active / Inactive
            
            $table->timestamps();

            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ngos');
    }
};
