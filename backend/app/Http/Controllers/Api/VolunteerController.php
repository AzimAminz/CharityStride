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
            'role_type_id' => [
                'required',
                'exists:volunteer_role_types,id',
                function ($attribute, $value, $fail) use ($eventId) {
                    // Check if this is "Others" role type
                    $roleType = \App\Models\VolunteerRoleType::find($value);
                    $isOthersType = $roleType && strtolower($roleType->code) === 'others';
                    
                    // For non-Others roles, ensure role type is unique per event
                    if (!$isOthersType) {
                        $exists = VolunteerRole::where('event_id', $eventId)
                            ->where('role_type_id', $value)
                            ->exists();
                        
                        if ($exists) {
                            $fail('This role type already exists in this event. Each event can only have one of each role type.');
                        }
                    }
                },
            ],
            'custom_role_name' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request, $eventId) {
                    // Check if this is "Others" role type
                    $roleType = \App\Models\VolunteerRoleType::find($request->role_type_id);
                    $isOthersType = $roleType && strtolower($roleType->code) === 'others';
                    
                    // If role type is "Others", custom name is required and must be unique per event
                    if ($isOthersType) {
                        if (empty($value)) {
                            $fail('Custom role name is required for "Others" role type.');
                            return;
                        }
                        
                        // Check for duplicate custom role name in the same event
                        $exists = VolunteerRole::where('event_id', $eventId)
                            ->whereHas('roleType', function($query) {
                                $query->where('code', 'others');
                            })
                            ->whereRaw('LOWER(custom_role_name) = ?', [strtolower($value)])
                            ->exists();
                        
                        if ($exists) {
                            $fail('This custom role name already exists in this event.');
                        }
                    }
                },
            ],
            'required_skill_id' => 'required|exists:required_skills,id',
            'role_description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location_details' => 'nullable|string',
            'has_tshirt' => 'boolean',
            'tshirt_description' => 'nullable|string',
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
            'role_type_id' => [
                'sometimes',
                'exists:volunteer_role_types,id',
                function ($attribute, $value, $fail) use ($eventId, $roleId) {
                    // Check if this is "Others" role type
                    $roleType = \App\Models\VolunteerRoleType::find($value);
                    $isOthersType = $roleType && strtolower($roleType->code) === 'others';
                    
                    // For non-Others roles, ensure role type is unique per event (exclude current role)
                    if (!$isOthersType) {
                        $exists = VolunteerRole::where('event_id', $eventId)
                            ->where('role_type_id', $value)
                            ->where('id', '!=', $roleId) // Exclude current role
                            ->exists();
                        
                        if ($exists) {
                            $fail('This role type already exists in this event. Each event can only have one of each role type.');
                        }
                    }
                },
            ],
            'custom_role_name' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request, $eventId, $roleId) {
                    // Get current role_type_id (from request or existing role)
                    $roleTypeId = $request->role_type_id ?? VolunteerRole::find($roleId)->role_type_id;
                    $roleType = \App\Models\VolunteerRoleType::find($roleTypeId);
                    $isOthersType = $roleType && strtolower($roleType->code) === 'others';
                    
                    // If role type is "Others", custom name is required and must be unique per event
                    if ($isOthersType) {
                        if (empty($value)) {
                            $fail('Custom role name is required for "Others" role type.');
                            return;
                        }
                        
                        // Check for duplicate custom role name in the same event (exclude current role)
                        $exists = VolunteerRole::where('event_id', $eventId)
                            ->whereHas('roleType', function($query) {
                                $query->where('code', 'others');
                            })
                            ->where('id', '!=', $roleId) // Exclude current role
                            ->whereRaw('LOWER(custom_role_name) = ?', [strtolower($value)])
                            ->exists();
                        
                        if ($exists) {
                            $fail('This custom role name already exists in this event.');
                        }
                    }
                },
            ],
            'required_skill_id' => 'sometimes|exists:required_skills,id',
            'role_description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location_details' => 'nullable|string',
            'has_tshirt' => 'boolean',
            'tshirt_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role->update($request->only([
            'role_type_id',
            'custom_role_name',
            'required_skill_id',
            'role_description',
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
