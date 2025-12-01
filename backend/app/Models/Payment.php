<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Payment extends Model
{


    protected $fillable = [
        'user_id',
        'event_id',
        'amount',
        'status',
        'transaction_id',
        'payment_method',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
