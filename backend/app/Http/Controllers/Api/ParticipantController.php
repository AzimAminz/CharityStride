<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\ParticipantConfig;
use App\Models\ParticipantCategory;
use App\Models\ParticipantFeeTier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ParticipantController extends Controller
{
    // ===== CONFIG =====
    
    public function getConfig($eventId)
    {
        $config = ParticipantConfig::where('event_id', $eventId)->first();
        
        if (!$config) {
            return response()->json([
                'participation_type' => 'free_event',
                'slot_limit_type' => 'unlimited',
                'total_slots' => null,
                'current_registrations' => 0
            ]);
        }
        
        return response()->json($config);
    }
    
    public function saveConfig(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'participation_type' => 'required|in:free_event,paid_event',
            'slot_limit_type' => 'required|in:limited,unlimited',
            'total_slots' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $config = ParticipantConfig::updateOrCreate(
            ['event_id' => $eventId],
            [
                ...$request->only(['participation_type', 'slot_limit_type', 'total_slots']),
                'current_registrations' => ParticipantConfig::where('event_id', $eventId)->value('current_registrations') ?? 0
            ]
        );

        return response()->json($config);
    }
    
    // ===== CATEGORIES =====
    
    public function getCategories($eventId)
    {
        $categories = ParticipantCategory::where('event_id', $eventId)
            ->with('feeTiers')
            ->get();
        
        return response()->json($categories);
    }
    
    public function createCategory(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'category_name' => 'required|string|max:255',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|date_format:H:i',
            'capacity_type' => 'required|in:unlimited,limited',
            'capacity' => 'required_if:capacity_type,limited|nullable|integer|min:1',
            'location_type' => 'required|in:event_location,custom',
            'location_name' => 'required_if:location_type,custom|nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_details' => 'nullable|string',
            'has_fee' => 'required|boolean',
            'fee_type' => 'nullable|in:fixed,tiered',
            'base_fee' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'has_event_tshirt' => 'boolean',
            'has_finisher_tshirt' => 'boolean',
            'has_bib' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = ParticipantCategory::create([
            'event_id' => $eventId,
            ...$request->only([
                'category_name',
                'event_date',
                'event_time',
                'capacity_type', 
                'capacity', 
                'location_type',
                'location_name',
                'latitude',
                'longitude',
                'location_details',
                'has_fee', 
                'fee_type', 
                'base_fee', 
                'description',
                'has_event_tshirt',
                'has_finisher_tshirt',
                'has_bib'
            ])
        ]);

        return response()->json($category->load('feeTiers'), 201);
    }
    
    public function updateCategory(Request $request, $eventId, $categoryId)
    {
        $category = ParticipantCategory::where('event_id', $eventId)->findOrFail($categoryId);
        
        $validator = Validator::make($request->all(), [
            'category_name' => 'sometimes|string|max:255',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|date_format:H:i',
            'capacity_type' => 'sometimes|in:unlimited,limited',
            'capacity' => 'nullable|integer|min:1',
            'location_type' => 'sometimes|in:event_location,custom',
            'location_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_details' => 'nullable|string',
            'has_fee' => 'sometimes|boolean',
            'fee_type' => 'nullable|in:fixed,tiered',
            'base_fee' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'has_event_tshirt' => 'boolean',
            'has_finisher_tshirt' => 'boolean',
            'has_bib' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category->update($request->only([
            'category_name',
            'event_date',
            'event_time',
            'capacity_type',
            'capacity',
            'location_type',
            'location_name',
            'latitude',
            'longitude',
            'location_details',
            'has_fee',
            'fee_type',
            'base_fee',
            'description',
            'has_event_tshirt',
            'has_finisher_tshirt',
            'has_bib'
        ]));

        return response()->json($category->load('feeTiers'));
    }
    
    public function deleteCategory($eventId, $categoryId)
    {
        $category = ParticipantCategory::where('event_id', $eventId)->findOrFail($categoryId);
        $category->delete();
        
        return response()->json(['message' => 'Category deleted successfully']);
    }
    
    // ===== FEE TIERS =====
    
    public function createTier(Request $request, $eventId, $categoryId)
    {
        $category = ParticipantCategory::where('event_id', $eventId)->findOrFail($categoryId);
        
        $validator = Validator::make($request->all(), [
            'tier_type' => 'required|in:early_bird,normal,late_registration',
            'tier_name' => 'required|string|max:100',
            'fee_amount' => 'required|integer|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tier = ParticipantFeeTier::create([
            'participant_category_id' => $categoryId,
            ...$request->only(['tier_type', 'tier_name', 'fee_amount', 'valid_from', 'valid_until'])
        ]);

        return response()->json($tier, 201);
    }
    
    public function updateTier(Request $request, $tierId)
    {
        $tier = ParticipantFeeTier::findOrFail($tierId);
        
        $validator = Validator::make($request->all(), [
            'tier_type' => 'sometimes|in:early_bird,normal,late_registration',
            'tier_name' => 'sometimes|string|max:100',
            'fee_amount' => 'sometimes|integer|min:0',
            'valid_from' => 'sometimes|date',
            'valid_until' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tier->update($request->only(['tier_type', 'tier_name', 'fee_amount', 'valid_from', 'valid_until']));

        return response()->json($tier);
    }
    
    public function deleteTier($tierId)
    {
        $tier = ParticipantFeeTier::findOrFail($tierId);
        $tier->delete();
        
        return response()->json(['message' => 'Fee tier deleted successfully']);
    }
}
