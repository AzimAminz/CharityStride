<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'accepts_money', // Removed
        'accepts_items', // Removed
        'has_target',
        'poster_url',
        'target_amount',
    ];

    protected $casts = [
        'has_target' => 'boolean',
        'target_amount' => 'integer',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
