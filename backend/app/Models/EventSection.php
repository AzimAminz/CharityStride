<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'title',
        'content',
        'images',
    ];

    protected $casts = [
        'images' => 'array', // JSON array of image URLs
    ];

    // Relationships
    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
