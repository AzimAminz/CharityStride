<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\VolunteerRole;
use App\Models\VolunteerShift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VolunteerController extends Controller
{
    // ===== ROLES =====
    
    public function getRoles($eventId)
    {
        $roles = VolunteerRole::where('event_id', $eventId)
            ->with('shifts')
            ->get();
        
        return response()->json($roles);
    }
    
    public function createRole(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'role_type_id' => 'required|exists:volunteer_role_types,id',
            'custom_role_name' => 'nullable|string|max:100',
            'required_skill_id' => 'required|exists:required_skills,id',
            'role_description' => 'nullable|string',
            'total_capacity' => 'required|integer|min:1',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_details' => 'nullable|string',
            'has_tshirt' => 'boolean',
            'tshirt_description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = VolunteerRole::create([
            'event_id' => $eventId,
            ...$request->only([
                'role_type_id', 
                'custom_role_name', 
                'required_skill_id', 
                'role_description', 
                'total_capacity', 
                'location', 
                'latitude', 
                'longitude', 
                'location_details',
                'has_tshirt',
                'tshirt_description'
            ])
        ]);

        return response()->json($role->load('shifts'), 201);
    }
    
    public function updateRole(Request $request, $eventId, $roleId)
    {
        $role = VolunteerRole::where('event_id', $eventId)->findOrFail($roleId);
        
        $validator = Validator::make($request->all(), [
            'role_type_id' => 'sometimes|exists:volunteer_role_types,id',
            'custom_role_name' => 'nullable|string|max:100',
            'required_skill_id' => 'sometimes|exists:required_skills,id',
            'role_description' => 'nullable|string',
            'total_capacity' => 'sometimes|integer|min:1',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_details' => 'nullable|string',
            'has_tshirt' => 'boolean',
            'tshirt_description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role->update($request->only([
            'role_type_id',
            'custom_role_name',
            'required_skill_id',
            'role_description',
            'total_capacity',
            'location',
            'latitude',
            'longitude',
            'location_details',
            'has_tshirt',
            'tshirt_description'
        ]));

        return response()->json($role->load('shifts'));
    }
    
    public function deleteRole($eventId, $roleId)
    {
        $role = VolunteerRole::where('event_id', $eventId)->findOrFail($roleId);
        $role->delete();
        
        return response()->json(['message' => 'Role deleted successfully']);
    }
    
    // ===== SHIFTS =====
    
    public function createShift(Request $request, $eventId, $roleId)
    {
        $role = VolunteerRole::where('event_id', $eventId)->findOrFail($roleId);
        
        $validator = Validator::make($request->all(), [
            'shift_date' => 'required|date',
            'shift_type_id' => 'required|exists:shift_types,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'capacity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $shift = VolunteerShift::create([
            'volunteer_role_id' => $roleId,
            ...$request->only(['shift_date', 'shift_type_id', 'start_time', 'end_time', 'capacity'])
        ]);

        return response()->json($shift, 201);
    }
    
    public function updateShift(Request $request, $eventId, $shiftId)
    {
        $shift = VolunteerShift::findOrFail($shiftId);
        
        $validator = Validator::make($request->all(), [
            'shift_date' => 'sometimes|date',
            'shift_type_id' => 'sometimes|exists:shift_types,id',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'capacity' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $shift->update($request->only(['shift_date', 'shift_type_id', 'start_time', 'end_time', 'capacity']));

        return response()->json($shift);
    }
    
    public function deleteShift($eventId, $shiftId)
    {
        $shift = VolunteerShift::findOrFail($shiftId);
        $shift->delete();
        
        return response()->json(['message' => 'Shift deleted successfully']);
    }
}
