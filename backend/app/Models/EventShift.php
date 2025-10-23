<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class EventShift extends Model
{


    protected $fillable = [
        'event_id',
        'date',
        'start_time',
        'end_time',
        'capacity',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }  
}
