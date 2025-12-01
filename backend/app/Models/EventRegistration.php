<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventRegistration extends Model
{
    protected $fillable = [
        'event_id',
        'user_id', 
        'shift_id',
        'run_category_id', 
        'status',
        'qr_code', 
        'attendance_marked', 
        'check_in_time', 
        'check_out_time', 
        'total_hours', 
        'finisher_qualified',      
        'tshirt_selection_completed'
    ];

    /**
     * Casting attributes
     */
    protected $casts = [
        'attendance_marked' => 'boolean',
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'total_hours' => 'decimal:2',
        'finisher_qualified' => 'boolean',      
        'tshirt_selection_completed' => 'boolean' 
    ];

    /**
     * Relationships
     */
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
        return $this->belongsTo(EventShift::class, 'shift_id');
    }

    public function runCategory()
    {
        return $this->belongsTo(CharityRunCategory::class, 'run_category_id'); 
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'registration_id'); 
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class, 'registration_id');
    }

    /**
     * Scope methods for easy querying
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Helper methods
     */
    public function markAttendance($checkInTime = null, $checkOutTime = null)
    {
        $this->update([
            'attendance_marked' => true,
            'check_in_time' => $checkInTime ?? now(),
            'check_out_time' => $checkOutTime ?? null,
        ]);

        // Calculate total hours if both times are provided
        if ($checkInTime && $checkOutTime) {
            $hours = $checkInTime->diffInHours($checkOutTime);
            $this->update(['total_hours' => $hours]);
        }
    }

    public function isVolunteerEvent()
    {
        return !is_null($this->shift_id);
    }

    public function isCharityRun()
    {
        return !is_null($this->run_category_id);
    }

    public function isFoodRescue()
    {
        return is_null($this->shift_id) && is_null($this->run_category_id);
    }
}