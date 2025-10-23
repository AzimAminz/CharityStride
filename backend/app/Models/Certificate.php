<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Certificate extends Model
{


    protected $fillable = [
        'registration_id',
        'template_id',
        'cert_path',
        'issued_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function registration()
    {
        return $this->belongsTo(EventRegistration::class);
    }

    public function template()
    {
        return $this->belongsTo(CertTemplate::class, 'template_id');
    }
}
