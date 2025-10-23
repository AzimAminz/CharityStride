<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;



class Event extends Model
{


    protected $fillable = [
        'ngo_id',
        'title',
        'description',
        'type',
        'location',
        'latitude',
        'longitude',
        'start_date',
        'end_date',
        'capacity',
        'fee',
        'early_bird_discount',
        'early_bird_deadline',
        'regular_fee',
        'status',
        'points',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function ngo()
    {
        return $this->belongsTo(Ngo::class);
    }

    public function shifts()
    {
        return $this->hasMany(EventShift::class);
    }

    public function sections()
    {
        return $this->hasMany(EventSection::class);
    }

    public function images()
    {
        return $this->hasMany(EventImage::class);
    }

    public function registrations()
    {
        return $this->hasMany(EventRegistration::class);
    }
}
