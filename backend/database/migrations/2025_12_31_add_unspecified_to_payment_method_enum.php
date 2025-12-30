<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter the enum column to include 'unspecified'
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('fpx', 'credit_card', 'debit_card', 'ewallet', 'unspecified', 'mock_gateway') NULL");
    }

    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('fpx', 'credit_card', 'debit_card', 'ewallet') NULL");
    }
};
