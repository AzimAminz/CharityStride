<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'registerable_type',
        'registerable_id',
        'cert_number',
        'participant_name',
        'event_title',
        'issued_at',
        'cert_template_id',
        'generated_path',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    // Auto-generate cert number on creation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($certificate) {
            if (empty($certificate->cert_number)) {
                $certificate->cert_number = 'CERT-' . strtoupper(uniqid());
            }
        });
    }

    // Polymorphic relationship
    public function registerable()
    {
        return $this->morphTo();
    }

    // Template relationship
    public function certTemplate()
    {
        return $this->belongsTo(CertTemplate::class);
    }

    // Constraint relationship for data integrity
    public function constraint()
    {
        return $this->hasOne(CertificateConstraint::class);
    }
}
