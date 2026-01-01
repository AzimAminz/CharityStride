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
        // 1. Drop Item Donation Options Table
        Schema::dropIfExists('item_donation_options');

        // 2. Update Donation Configs
        Schema::table('donation_configs', function (Blueprint $table) {
            $table->dropColumn(['accepts_money', 'accepts_items']);
            $table->boolean('has_target')->default(false)->after('event_id');
        });

        // 3. Update Donation Registrations
        Schema::table('donation_registrations', function (Blueprint $table) {
            $table->dropColumn(['donation_type', 'item_name', 'quantity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Recreate Item Donation Options
        Schema::create('item_donation_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->enum('item_category', ['food', 'clothing', 'medical_supplies', 'school_supplies']);
            $table->string('item_name');
            $table->text('item_description')->nullable();
            $table->enum('quantity_type', ['fixed', 'flexible']);
            $table->integer('target_quantity')->nullable();
            $table->string('unit', 20)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index('event_id');
        });

        // 2. Revert Donation Configs
        Schema::table('donation_configs', function (Blueprint $table) {
            $table->boolean('accepts_money')->default(false);
            $table->boolean('accepts_items')->default(false);
            $table->dropColumn('has_target');
        });

        // 3. Revert Donation Registrations
        Schema::table('donation_registrations', function (Blueprint $table) {
            $table->enum('donation_type', ['money', 'item'])->after('user_id');
            $table->string('item_name')->nullable();
            $table->integer('quantity')->nullable();
        });
    }
};
