<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventDuplicateController extends Controller
{
    /**
     * Duplicate an existing event
     */
    public function duplicate(Request $request, $id)
    {
        $ngo = $request->user()->ngo;
        
        // Find original event
        $originalEvent = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->with(['sections', 'charityRunCategories', 'shifts', 'foodDonation'])
            ->first();

        if (!$originalEvent) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        // Create duplicate (as draft)
        $duplicate = Event::create([
            'ngo_id' => $ngo->id,
            'title' => $originalEvent->title . ' (Copy)',
            'description' => $originalEvent->description,
            'type' => $originalEvent->type,
            'location' => $originalEvent->location,
            'latitude' => $originalEvent->latitude,
            'longitude' => $originalEvent->longitude,
            'start_date' => $originalEvent->start_date,
            'end_date' => $originalEvent->end_date,
            'capacity' => $originalEvent->capacity,
            'fee' => $originalEvent->fee,
            'has_tshirt' => $originalEvent->has_tshirt,
            'thumbnail' => $originalEvent->thumbnail,
            'status' => 'open',
            'is_published' => false, // Always create as draft
        ]);

        // Duplicate sections
        foreach ($originalEvent->sections as $section) {
            $duplicate->sections()->create([
                'title' => $section->title,
                'content' => $section->content,
            ]);
        }

        // Duplicate charity run categories
        if ($originalEvent->type === 'charity_run') {
            foreach ($originalEvent->charityRunCategories as $category) {
                $duplicate->charityRunCategories()->create([
                    'category_name' => $category->category_name,
                    'distance_km' => $category->distance_km,
                    'fee' => $category->fee,
                    'capacity' => $category->capacity,
                    'includes_event_tee' => $category->includes_event_tee,
                    'includes_finisher_tee' => $category->includes_finisher_tee,
                ]);
            }
        }

        // Duplicate volunteer shifts
        if ($originalEvent->type === 'volunteer') {
            foreach ($originalEvent->shifts as $shift) {
                $duplicate->shifts()->create([
                    'shift_date' => $shift->shift_date,
                    'start_time' => $shift->start_time,
                    'end_time' => $shift->end_time,
                    'capacity' => $shift->capacity,
                ]);
            }
        }

        // Duplicate food donation
        if ($originalEvent->type === 'food_donation' && $originalEvent->foodDonation) {
            $duplicate->foodDonation()->create([
                'food_type' => $originalEvent->foodDonation->food_type,
                'quantity' => $originalEvent->foodDonation->quantity,
                'unit' => $originalEvent->foodDonation->unit,
                'contact_person' => $originalEvent->foodDonation->contact_person,
                'contact_phone' => $originalEvent->foodDonation->contact_phone,
                'fee' => $originalEvent->foodDonation->fee,
            ]);
        }

        return response()->json([
            'message' => 'Event duplicated successfully',
            'event' => $duplicate->load(['sections', 'charityRunCategories', 'shifts', 'foodDonation']),
        ], 201);
    }
}
