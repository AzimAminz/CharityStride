<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemDonationOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'item_category',
        'item_name',
        'item_description',
        'quantity_type',
        'target_quantity',
        'unit',
        'description', // Keep for backwards compatibility
    ];

    protected $casts = [
        'target_quantity' => 'integer',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
