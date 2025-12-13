<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VolunteerRoleType;
use App\Models\ParticipantCategoryType;
use App\Models\RequiredSkill;
use App\Models\ShiftType;
use Illuminate\Http\Request;

class LookupDataController extends Controller
{
    /**
     * Get all volunteer role types
     */
    public function volunteerRoleTypes()
    {
        $roleTypes = VolunteerRoleType::active()
            ->orderBy('display_order')
            ->get();
        
        return response()->json($roleTypes);
    }

    /**
     * Get all participant category types
     */
    public function participantCategoryTypes()
    {
        $categoryTypes = ParticipantCategoryType::active()
            ->orderBy('display_order')
            ->get();
        
        return response()->json($categoryTypes);
    }

    /**
     * Get all required skills
     */
    public function requiredSkills()
    {
        $skills = RequiredSkill::active()
            ->orderBy('display_order')
            ->get();
        
        return response()->json($skills);
    }

    /**
     * Get all shift types
     */
    public function shiftTypes()
    {
        $shiftTypes = ShiftType::active()
            ->orderBy('display_order')
            ->get();
        
        return response()->json($shiftTypes);
    }

    /**
     * Get all lookup data at once (for initial load)
     */
    public function all()
    {
        return response()->json([
            'volunteer_role_types' => VolunteerRoleType::active()->orderBy('display_order')->get(),
            'participant_category_types' => ParticipantCategoryType::active()->orderBy('display_order')->get(),
            'required_skills' => RequiredSkill::active()->orderBy('display_order')->get(),
            'shift_types' => ShiftType::active()->orderBy('display_order')->get(),
        ]);
    }
}
