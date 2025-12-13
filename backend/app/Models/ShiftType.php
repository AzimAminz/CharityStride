<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ms',
        'duration_hours',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'duration_hours' => 'decimal:2',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function volunteerShifts()
    {
        return $this->hasMany(VolunteerShift::class, 'shift_type_id');
    }

    // Scope for active types
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
