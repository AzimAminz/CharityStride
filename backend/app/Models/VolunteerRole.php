<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VolunteerRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'role_type_id',
        'custom_role_name',
        'required_skill_id',
        'role_description',
        'total_capacity',
        'location',
        'latitude',
        'longitude',
        'location_details',
        'has_tshirt',
        'tshirt_description',
    ];

    protected $casts = [
        'total_capacity' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'has_tshirt' => 'boolean',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function roleType()
    {
        return $this->belongsTo(VolunteerRoleType::class, 'role_type_id');
    }

    public function requiredSkill()
    {
        return $this->belongsTo(RequiredSkill::class);
    }

    public function shifts()
    {
        return $this->hasMany(VolunteerShift::class);
    }

    public function registrations()
    {
        return $this->hasMany(VolunteerRegistration::class);
    }

    // Computed current count (avoiding race conditions)
    public function getCurrentCountAttribute()
    {
        return $this->registrations()->whereIn('status', ['approved', 'completed'])->count();
    }
}
