<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('auditable_type', 100); // Model class name
            $table->unsignedBigInteger('auditable_id');
            $table->enum('event_type', ['created', 'updated', 'deleted', 'status_changed', 'approved', 'rejected']);
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            // Composite indexes for efficient queries
            $table->index(['auditable_type', 'auditable_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('event_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
