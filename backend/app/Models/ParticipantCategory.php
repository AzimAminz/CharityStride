<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParticipantCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'category_name',
        'event_date',
        'event_time',
        'capacity_type',
        'capacity',
        'location_type',
        'location_name',
        'latitude',
        'longitude',
        'location_details',
        'has_fee',
        'fee_type',
        'base_fee',
        'description',
        'has_event_tshirt',
        'has_finisher_tshirt',
        'version',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'has_fee' => 'boolean',
        'base_fee' => 'integer',
        'has_event_tshirt' => 'boolean',
        'has_finisher_tshirt' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'version' => 'integer',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function feeTiers()
    {
        return $this->hasMany(ParticipantFeeTier::class, 'participant_category_id');
    }

    public function registrations()
    {
        return $this->hasMany(ParticipantRegistration::class, 'participant_category_id');
    }

    // Computed current count (avoid race conditions)
    public function getCurrentCountAttribute()
    {
        return $this->registrations()->whereIn('status', ['confirmed', 'completed'])->count();
    }

    // Accessor for base fee in ringgit
    public function getBaseFeeInRinggitAttribute()
    {
        return $this->base_fee ? $this->base_fee / 100 : null;
    }
}
