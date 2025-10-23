<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Ngo extends Model
{
    //


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

    //relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
