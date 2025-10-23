<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class EventImage extends Model
{

    protected $fillable = [
        'event_id',
        'section_id',
        'image_url',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function section()
    {
        return $this->belongsTo(EventSection::class);
    }
}
