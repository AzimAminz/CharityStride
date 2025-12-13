<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParticipantCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'category_type_id',
        'custom_category_name',
        'capacity',
        'has_fee',
        'fee_type',
        'base_fee', // In CENTS
        'description',
        'has_tshirt',
        'tshirt_description',
        'version', // Optimistic locking
    ];

    protected $casts = [
        'capacity' => 'integer',
        'has_fee' => 'boolean',
        'base_fee' => 'integer', // Integer cents
        'has_tshirt' => 'boolean',
        'version' => 'integer',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function categoryType()
    {
        return $this->belongsTo(ParticipantCategoryType::class);
    }

    public function feeTiers()
    {
        return $this->hasMany(ParticipantFeeTier::class);
    }

    public function registrations()
    {
        return $this->hasMany(ParticipantRegistration::class);
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
