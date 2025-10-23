<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class CertTemplate extends Model
{


    protected $fillable = [
        'ngo_id',
        'name',
        'template_path',
        'description',
    ];

    public function ngo()
    {
        return $this->belongsTo(Ngo::class);
    }
}
