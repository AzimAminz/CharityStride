<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'role',
        'status',
        'phone',
        'ic_number',
        'birthdate',
        'photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birthdate' => 'date:Y-m-d',
        'status' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function ngo()
    {
        return $this->hasOne(Ngo::class);
    }

    public function volunteerRegistrations()
    {
        return $this->hasMany(VolunteerRegistration::class);
    }

    public function participantRegistrations()
    {
        return $this->hasMany(ParticipantRegistration::class);
    }

    public function donationRegistrations()
    {
        return $this->hasMany(DonationRegistration::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
