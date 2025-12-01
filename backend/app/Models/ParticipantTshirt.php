<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParticipantTshirt extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id',
        'tshirt_type',
        'size_id',
        'quantity',
        'status',
        'pickup_code',
        'collected_at',
        'notes'
    ];

    protected $casts = [
        'tshirt_type' => 'string',
        'quantity' => 'integer',
        'status' => 'string',
        'collected_at' => 'datetime'
    ];

    public function registration()
    {
        return $this->belongsTo(EventRegistration::class);
    }

    public function size()
    {
        return $this->belongsTo(TshirtSize::class, 'size_id');
    }

    public function collections()
    {
        return $this->hasMany(TshirtCollection::class, 'participant_tshirt_id');
    }
}