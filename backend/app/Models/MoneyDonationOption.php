<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoneyDonationOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'suggested_amount', // In CENTS
        'description',
    ];

    protected $casts = [
        'suggested_amount' => 'integer', // Integer cents
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Accessor for display (convert cents to ringgit)
    public function getAmountInRinggitAttribute()
    {
        return $this->suggested_amount / 100;
    }
}
