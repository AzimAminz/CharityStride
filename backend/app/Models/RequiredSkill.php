<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequiredSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ms',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function volunteerRoles()
    {
        return $this->hasMany(VolunteerRole::class, 'required_skill_id');
    }

    // Scope for active skills
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
