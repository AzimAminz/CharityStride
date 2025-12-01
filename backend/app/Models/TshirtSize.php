<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TshirtSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'size_code', 
        'size_name', 
        'description'
    ];

    public function eventTshirts()
    {
        return $this->hasMany(EventTshirt::class, 'size_id');
    }

    public function participantTshirts()
    {
        return $this->hasMany(ParticipantTshirt::class, 'size_id');
    }
}