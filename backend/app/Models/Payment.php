<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'payable_type',
        'payable_id',
        'user_id',
        'amount', // In CENTS
        'currency',
        'payment_method',
        'payment_status',
        'payment_reference',
        'payment_gateway',
        'gateway_response',
        'paid_at',
        'refunded_at',
        'refund_amount', // In CENTS
        'refund_reason',
        'notes',
    ];

    protected $casts = [
        'amount' => 'integer', // Integer cents
        'refund_amount' => 'integer', // Integer cents
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Polymorphic relationship
    public function payable()
    {
        return $this->morphTo();
    }

    // User relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Constraint relationship for data integrity
    public function constraint()
    {
        return $this->hasOne(PaymentConstraint::class);
    }

    // Accessors for ringgit
    public function getAmountInRinggitAttribute()
    {
        return $this->amount / 100;
    }

    public function getRefundAmountInRinggitAttribute()
    {
        return $this->refund_amount ? $this->refund_amount / 100 : null;
    }
}
