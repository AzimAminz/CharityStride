<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParticipantFeeTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_category_id',
        'tier_name',
        'amount', // In CENTS
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'amount' => 'integer', // Integer cents
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    // Relationships
    public function participantCategory()
    {
        return $this->belongsTo(ParticipantCategory::class);
    }

    // Check if tier is currently active
    public function isActive()
    {
        $now = now();
        return (!$this->starts_at || $now->greaterThanOrEqualTo($this->starts_at)) &&
               (!$this->ends_at || $now->lessThanOrEqualTo($this->ends_at));
    }

    // Accessor for amount in ringgit
    public function getAmountInRinggitAttribute()
    {
        return $this->amount / 100;
    }
}
