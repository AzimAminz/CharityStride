<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertificateConstraint extends Model
{
    use HasFactory;

    public $timestamps = false; // No timestamps for constraint table
    protected $primaryKey = 'certificate_id';

    protected $fillable = [
        'certificate_id',
        'participant_registration_id',
        'volunteer_registration_id',
    ];

    // Relationships
    public function certificate()
    {
        return $this->belongsTo(Certificate::class);
    }

    public function participantRegistration()
    {
        return $this->belongsTo(ParticipantRegistration::class);
    }

    public function volunteerRegistration()
    {
        return $this->belongsTo(VolunteerRegistration::class);
    }
}
