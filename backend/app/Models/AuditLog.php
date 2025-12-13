<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false; // Only created_at (no updated_at)
    const UPDATED_AT = null;

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'event_type',
        'user_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    // Polymorphic relationship
    public function auditable()
    {
        return $this->morphTo();
    }

    // User relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper method to log changes
    public static function logChange($model, $eventType, $oldValues = null, $newValues = null)
    {
        return static::create([
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'event_type' => $eventType,
            'user_id' => auth()->id(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
