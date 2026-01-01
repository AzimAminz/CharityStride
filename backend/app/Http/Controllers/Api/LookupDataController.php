<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VolunteerRoleType;
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
            'shift_types' => ShiftType::active()->orderBy('display_order')->get(),
        ]);
    }
}
