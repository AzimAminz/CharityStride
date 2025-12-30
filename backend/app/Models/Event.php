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
        'event_date',
        'has_event_date',
        'longitude',
        'latitude',
        'address',
        'city',
        'state',
        'is_published',
        'published_at',
        'registration_count',
        'has_volunteer',
        'has_donation',
        'has_participant',
    ];

    protected $appends = ['stats', 'location'];

    /**
     * Get location attribute (backward compatibility with address)
     */
    public function getLocationAttribute()
    {
        return $this->address;
    }

    /**
     * Get registration stats for this event
     */
    public function getStatsAttribute()
    {
        $stats = [];
        
        // Only include participants if has_participant is enabled
        if ($this->has_participant) {
            $stats['participants'] = $this->participantRegistrations()
                ->where('status', 'confirmed')
                ->count();
        }
        
        // Only include volunteers if has_volunteer is enabled
        if ($this->has_volunteer) {
            $stats['volunteers'] = $this->volunteerRegistrations()
                ->where('status', 'approved')
                ->count();
        }
        
        // Only include donations if has_donation is enabled
        if ($this->has_donation) {
            $stats['donations'] = $this->donationRegistrations()
                ->count();
        }
        
        return $stats;
    }

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'event_date' => 'date',
        'has_event_date' => 'boolean',
        'longitude' => 'decimal:7',
        'latitude' => 'decimal:7',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'registration_count' => 'integer',
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

    // Query Scopes for Public Event Discovery
    
    /**
     * Scope to filter only published events
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to filter events with registration still open
     */
    public function scopeOpenForRegistration($query)
    {
        return $query->where('end_date', '>=', now()->toDateString());
    }

    /**
     * Scope to filter events within a radius (in km) from a location
     * Uses Haversine formula for distance calculation
     */
    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        $haversine = "(6371 * acos(cos(radians(?)) 
                     * cos(radians(latitude)) 
                     * cos(radians(longitude) - radians(?)) 
                     + sin(radians(?)) 
                     * sin(radians(latitude))))";
        
        return $query
            ->selectRaw("{$haversine} AS distance", [$latitude, $longitude, $latitude])
            ->whereRaw("{$haversine} <= ?", [$latitude, $longitude, $latitude, $radius])
            ->orderBy('distance');
    }

    /**
     * Scope for full-text search
     */
    public function scopeSearch($query, $searchTerm)
    {
        if (empty($searchTerm)) {
            return $query;
        }

        return $query->whereRaw(
            "MATCH(title, description, address) AGAINST(? IN NATURAL LANGUAGE MODE)",
            [$searchTerm]
        );
    }
}
