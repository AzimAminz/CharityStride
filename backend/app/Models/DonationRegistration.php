<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DonationRegistration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'user_id',
        'donation_type',
        'amount_paid', // In CENTS for money
        'item_name',
        'quantity',
    ];

    protected $casts = [
        'amount_paid' => 'integer', // Integer cents
        'quantity' => 'integer',
        'deleted_at' => 'datetime',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    // Accessor for amount in ringgit
    public function getAmountInRinggitAttribute()
    {
        return $this->amount_paid ? $this->amount_paid / 100 : null;
    }
}
