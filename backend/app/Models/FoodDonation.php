<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodDonation extends Model
{
    use HasFactory;

    protected $table = 'food_donation'; 

    protected $fillable = [
        'event_id',
        'food_type',
        'quantity',
        'unit',
        'collection_instructions',
        'contact_person',
        'contact_phone'
    ];

    /**
     * Relationships
     */
    protected $casts = [
        'fee' => 'decimal:2',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }


    // Quantity calculation methods...
    public function getRemainingQuantityAttribute()
    {
        $totalOrdered = $this->orders()
            ->whereIn('status', ['pending', 'confirmed'])
            ->sum('quantity_ordered');
            
        return $this->quantity - $totalOrdered;
    }
}