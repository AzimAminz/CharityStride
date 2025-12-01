<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TshirtCollection extends Model
{
    use HasFactory;

    protected $table = 'tshirt_collections';

    protected $fillable = [
        'participant_tshirt_id',
        'user_id',
        'collection_point',
        'latitude',         
        'longitude',         
        'address', 
        'collection_method',
        'delivery_address',
        'tracking_number',
        'status',
        'collected_at'
    ];

    protected $casts = [
        'collection_method' => 'string',
        'status' => 'string',
        'collected_at' => 'datetime',
        'latitude' => 'decimal:6',    
        'longitude' => 'decimal:6' 
    ];

    public function participantTshirt()
    {
        return $this->belongsTo(ParticipantTshirt::class, 'participant_tshirt_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}