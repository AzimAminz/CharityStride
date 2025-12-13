<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentConstraint extends Model
{
    use HasFactory;

    public $timestamps = false; // No timestamps for constraint table
    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'payment_id',
        'participant_registration_id',
        'donation_registration_id',
        'volunteer_registration_id',
    ];

    // Relationships
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function participantRegistration()
    {
        return $this->belongsTo(ParticipantRegistration::class);
    }

    public function donationRegistration()
    {
        return $this->belongsTo(DonationRegistration::class);
    }

    public function volunteerRegistration()
    {
        return $this->belongsTo(VolunteerRegistration::class);
    }
}
