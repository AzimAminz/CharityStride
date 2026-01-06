<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ParticipantRegistration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'user_id',
        'participant_category_id',
        'emergency_contact_name',
        'emergency_contact_phone',
        'preferred_session',
        'special_requirements',
        'fee_tier_id',
        'amount_paid', // In CENTS
        'status',
        'bib_number',
        'qr_code',
        'attendance_status',
        'check_in_time',
        'tshirt_size',
        'tshirt_collected',
        'tshirt_collected_at',
        'verified_by_user_id',
    ];

    protected $casts = [
        'amount_paid' => 'integer', // Integer cents
        'check_in_time' => 'datetime',
        'tshirt_collected' => 'boolean',
        'tshirt_collected_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Auto-generate QR code and BIB number on creation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($registration) {
            if (empty($registration->qr_code)) {
                $registration->qr_code = 'PAR-' . strtoupper(uniqid());
            }
            if (empty($registration->bib_number)) {
                // Check if category requires BIB
                $category = ParticipantCategory::find($registration->participant_category_id);
                if ($category && $category->has_bib) {
                    // Generate sequential bib number per event
                    $lastBib = static::where('event_id', $registration->event_id)
                        ->whereNotNull('bib_number')
                        ->orderByDesc('id')
                        ->value('bib_number');
                    
                    $nextNumber = $lastBib ? ((int) filter_var($lastBib, FILTER_SANITIZE_NUMBER_INT)) + 1 : 1;
                    $registration->bib_number = 'BIB-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function participantCategory()
    {
        return $this->belongsTo(ParticipantCategory::class);
    }

    public function feeTier()
    {
        return $this->belongsTo(ParticipantFeeTier::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function certificate()
    {
        return $this->morphOne(Certificate::class, 'registerable');
    }

    // Accessor for amount in ringgit
    public function getAmountInRinggitAttribute()
    {
        return $this->amount_paid / 100;
    }
}
