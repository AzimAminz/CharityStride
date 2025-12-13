<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavedLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'ngo_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    // Relationships
    public function ngo()
    {
        return $this->belongsTo(Ngo::class);
    }
}
