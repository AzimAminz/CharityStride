<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'accepts_money',
        'accepts_items',
    ];

    protected $casts = [
        'accepts_money' => 'boolean',
        'accepts_items' => 'boolean',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
