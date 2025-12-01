<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CharityRunCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'category_name', 
        'distance_km',
        'fee',
        'capacity',
        'includes_event_tee',     
        'includes_finisher_tee'
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'fee' => 'decimal:2',
        'includes_event_tee' => 'boolean',
        'includes_finisher_tee' => 'boolean'
    ];

    /**
     * Relationships
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class, 'run_category_id');
    }
}