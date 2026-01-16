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
        'status',
        'taken_down_at',
        'take_down_reason',
    ];

    protected static function booted()
    {
        static::forceDeleting(function ($event) {
            // 1. Delete simple child relations (no further children or with cascade)
            $event->sections()->delete();
            $event->donationConfig()->delete();
            $event->participantConfig()->delete();
            $event->registrationLinks()->delete();
            $event->reviews()->delete();
            $event->unpublishRequests()->delete();
            
            // 2. Delete relations that might have their own dependencies
            // Use each()->delete() to trigger their own deleting events if they have any
            
            // Volunteer Roles -> Shifts
            $event->volunteerRoles()->each(function($role) {
                // If VolunteerRole has shifts, ensure they are deleted too.
                // Assuming VolunteerRole model handles its own children or we do it here if not.
                $role->shifts()->delete(); 
                $role->registrations()->delete(); // Accessing registrations via role
                $role->delete();
            });
            // Also delete volunteer registrations directly linked to event if any (redundant check usually)
            $event->volunteerRegistrations()->delete();


            // Participant Categories -> Tiers
            $event->participantCategories()->each(function($category) {
                $category->tiers()->delete();
                $category->delete();
            });
            // Delete participant registrations
            $event->participantRegistrations()->each(function($reg) {
                $reg->payments()->delete(); // If payments linked to reg
                $reg->delete();
            });
            
            // Donation Registrations
            $event->donationRegistrations()->each(function($reg) {
                $reg->payments()->delete();
                $reg->delete();
            });

        });
    }

    /**
     * Get the price range for participant categories
     */
    public function getPriceRangeAttribute()
    {
        if (!$this->has_participant) {
            return null;
        }

        $categories = $this->participantCategories;
        
        if ($categories->isEmpty()) {
            return 'Free';
        }

        $fees = $categories->map(function($cat) {
            return $cat->has_fee ? $cat->base_fee : 0;
        });

        $min = $fees->min();
        $max = $fees->max();

        if ($min === 0 && $max === 0) {
            return 'Free';
        }

        if ($min === $max) {
            return "RM " . number_format($min / 100, 2);
        }

        return "RM " . number_format($min / 100, 2) . " - " . number_format($max / 100, 2);
    }

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
            $donations = $this->donationRegistrations()
                ->with(['payments' => function($q) {
                    $q->where('payment_status', 'paid');
                }])
                ->get();

            $stats['donations'] = $donations->filter(function($reg) {
                return $reg->payments->isNotEmpty();
            })->count();

            $stats['total_raised'] = $donations->sum(function($reg) {
                return $reg->payments->sum('amount');
            });
        }
        
        return $stats;
    }

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'event_date' => 'date:Y-m-d',
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
        'taken_down_at' => 'datetime',
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

    public function unpublishRequests()
    {
        return $this->hasMany(EventUnpublishRequest::class);
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
            ->select('*')
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

    /**
     * Check if event is editable
     */
    public function isEditable()
    {
        return !$this->is_published;
    }
}
