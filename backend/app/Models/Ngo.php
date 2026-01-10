<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ngo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'registration_no',
        'registration_type',
        'category',
        'established_date',
        'description',
        'address',
        'city',
        'state',
        'postcode',
        'latitude',
        'longitude',
        'contact_email',
        'contact_phone',
        'bank_name',
        'bank_account_no',
        'bank_account_name',
        'registration_doc_url',
        'logo_url',
        'status',
    ];

    protected $casts = [
        'established_date' => 'date:Y-m-d',
        'latitude' => 'decimal:6',
        'longitude' => 'decimal:6',
        'deleted_at' => 'datetime',
    ];

    public function getLogoUrlAttribute($value)
    {
        if ($value && !str_starts_with($value, 'http')) {
            return asset('storage/' . $value);
        }
        return $value;
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function activeEvents()
    {
        return $this->hasMany(Event::class)
            ->where('is_published', true)
            ->whereNull('taken_down_at');
    }

    public function savedLocations()
    {
        return $this->hasMany(SavedLocation::class);
    }

    public function certTemplates()
    {
        return $this->hasMany(CertTemplate::class);
    }

    public function donationRegistrations()
    {
        return $this->hasManyThrough(DonationRegistration::class, Event::class);
    }
}
