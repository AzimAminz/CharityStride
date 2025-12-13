<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VolunteerShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'volunteer_role_id',
        'shift_date',
        'shift_type_id',
        'start_time',
        'end_time',
        'capacity',
    ];

    protected $casts = [
        'shift_date' => 'date',
        'capacity' => 'integer',
    ];

    // Relationships
    public function volunteerRole()
    {
        return $this->belongsTo(VolunteerRole::class);
    }

    public function shiftType()
    {
        return $this->belongsTo(ShiftType::class);
    }

    public function registrations()
    {
        return $this->hasMany(VolunteerRegistration::class);
    }

    // Computed current count
    public function getCurrentCountAttribute()
    {
        return $this->registrations()->whereIn('status', ['approved', 'completed'])->count();
    }
}
