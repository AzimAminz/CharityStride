<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class EventSection extends Model
{


    protected $fillable = [
        'event_id',
        'title',
        'content',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function images()
    {
        return $this->hasMany(EventImage::class);
    }
}
