<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class EventRegistration extends Model
{


    protected $fillable = [
        'event_id',
        'user_id',
        'shift_id',
        'status',
        'points_earned',
        'payment_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function shift()
    {
        return $this->belongsTo(EventShift::class);
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
