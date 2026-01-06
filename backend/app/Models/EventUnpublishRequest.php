<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventUnpublishRequest extends Model
{
    protected $fillable = [
        'event_id',
        'reason',
        'status',
        'admin_note',
        'processed_at',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
