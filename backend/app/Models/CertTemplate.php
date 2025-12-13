<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'ngo_id',
        'template_name',
        'background_image_url',
        'font_family',
        'font_size',
        'font_color',
        'layout_data',
    ];

    protected $casts = [
        'font_size' => 'integer',
        'layout_data' => 'array', // JSON layout configuration
    ];

    // Relationships
    public function ngo()
    {
        return $this->belongsTo(Ngo::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
}
