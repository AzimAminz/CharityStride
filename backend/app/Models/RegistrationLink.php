<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'module_type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
