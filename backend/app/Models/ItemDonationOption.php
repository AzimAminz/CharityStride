<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemDonationOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'item_name',
        'quantity_needed',
        'description',
    ];

    protected $casts = [
        'quantity_needed' => 'integer',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
