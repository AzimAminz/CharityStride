<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ngo_id',
        'title',
        'description',
        'thumbnail',
        'start_date',
        'end_date',
        'is_published',
        'has_volunteer',
        'has_donation',
        'has_participant',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_published' => 'boolean',
        'has_volunteer' => 'boolean',
        'has_donation' => 'boolean',
        'has_participant' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function ngo()
    {
        return $this->belongsTo(Ngo::class);
    }

    public function sections()
    {
        return $this->hasMany(EventSection::class);
    }

    // Volunteer module
    public function volunteerRoles()
    {
        return $this->hasMany(VolunteerRole::class);
    }

    public function volunteerRegistrations()
    {
        return $this->hasMany(VolunteerRegistration::class);
    }

    // Donation module
    public function donationConfig()
    {
        return $this->hasOne(DonationConfig::class);
    }

    public function moneyDonationOptions()
    {
        return $this->hasMany(MoneyDonationOption::class);
    }

    public function itemDonationOptions()
    {
        return $this->hasMany(ItemDonationOption::class);
    }

    public function donationRegistrations()
    {
        return $this->hasMany(DonationRegistration::class);
    }

    // Participant module
    public function participantConfig()
    {
        return $this->hasOne(ParticipantConfig::class);
    }

    public function participantCategories()
    {
        return $this->hasMany(ParticipantCategory::class);
    }

    public function participantRegistrations()
    {
        return $this->hasMany(ParticipantRegistration::class);
    }

    // Supporting
    public function registrationLinks()
    {
        return $this->hasMany(RegistrationLink::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
