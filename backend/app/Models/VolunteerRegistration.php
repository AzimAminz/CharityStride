<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class VolunteerRegistration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'user_id',
        'volunteer_role_id',
        'volunteer_shift_id',
        'experience_level',
        'availability_notes',
        'status',
        'qr_code',
        'attendance_status',
        'check_in_time',
        'check_out_time',
        'total_hours',
        'tshirt_size',
        'tshirt_collected',
        'tshirt_collected_at',
        'verified_by_user_id',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'total_hours' => 'decimal:2',
        'tshirt_collected' => 'boolean',
        'tshirt_collected_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Auto-generate QR code on creation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($registration) {
            if (empty($registration->qr_code)) {
                $registration->qr_code = 'VOL-' . strtoupper(uniqid());
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

    public function volunteerRole()
    {
        return $this->belongsTo(VolunteerRole::class);
    }

    public function volunteerShift()
    {
        return $this->belongsTo(VolunteerShift::class);
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
}
