<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventTshirt extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'tshirt_type',
        'size_id',
        'quantity_total',
        'quantity_available'
    ];

    protected $casts = [
        'tshirt_type' => 'string',
        'quantity_total' => 'integer',
        'quantity_available' => 'integer'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function size()
    {
        return $this->belongsTo(TshirtSize::class, 'size_id');
    }
}