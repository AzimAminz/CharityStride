<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * List NGO's events (with filters)
     */
    public function index(Request $request)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        $query = Event::where('ngo_id', $ngo->id)
            ->with(['sections']);

        // Filter by published status
        if ($request->has('is_published')) {
            $query->where('is_published', $request->is_published);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($events);
    }

    /**
     * Create new event (draft by default)
     */
    public function store(Request $request)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        // Validation for modular event system
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'has_volunteer' => 'boolean',
            'has_donation' => 'boolean',
            'has_participant' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'has_event_date' => 'boolean',
            'event_date' => $request->has_event_date ? 'required|date' : 'nullable|date',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'address' => 'nullable|string',
            'thumbnail' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create event with module enablers
        $event = Event::create([
            'ngo_id' => $ngo->id,
            'title' => $request->title,
            'description' => $request->description,
            'has_volunteer' => $request->has_volunteer ?? false,
            'has_donation' => $request->has_donation ?? false,
            'has_participant' => $request->has_participant ?? false,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'has_event_date' => $request->has_event_date ?? false,
            'event_date' => $request->has_event_date ? $request->event_date : null,
            'longitude' => $request->longitude,
            'latitude' => $request->latitude,
            'address' => $request->address,
            'status' => 'open',
            'is_published' => false,
            'thumbnail' => $request->thumbnail,
        ]);

        return response()->json([
            'message' => 'Event created as draft',
            'event' => $event
        ], 201);
    }

    /**
     * Get event details
     */
    public function show(Request $request, $id)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        $event = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->with([
                'sections',
                'ngo',
                'participantCategories',
                'volunteerRoles' => function($query) {
                    $query->with(['shifts', 'roleType', 'requiredSkill']);
                },
                'donationConfig',
                'itemDonationOptions'
            ])
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        // Ensure volunteerRoles is always an array in JSON response
        $eventArray = $event->toArray();
        if (!isset($eventArray['volunteer_roles'])) {
            $eventArray['volunteer_roles'] = [];
        }

        return response()->json($eventArray);
    }

    /**
     * Update event
     */
    public function update(Request $request, $id)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        $event = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'string',
            'has_volunteer' => 'boolean',
            'has_donation' => 'boolean',
            'has_participant' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
            'has_event_date' => 'boolean',
            'event_date' => $request->has_event_date ? 'required|date' : 'nullable|date',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
            'address' => 'nullable|string',
            'status' => 'in:open,closed,completed',
            'thumbnail' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Clear event_date if has_event_date is false
        $updateData = $request->only([
            'title',
            'description',
            'has_volunteer',
            'has_donation',
            'has_participant',
            'start_date',
            'end_date',
            'has_event_date',
            'longitude',
            'latitude',
            'address',
            'status',
            'thumbnail',
        ]);
        
        if (isset($updateData['has_event_date'])) {
            if ($updateData['has_event_date']) {
                $updateData['event_date'] = $request->event_date;
            } else {
                $updateData['event_date'] = null;
            }
        }

        $event->update($updateData);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event
        ]);
    }

    /**
     * Delete event (only drafts)
     */
    public function destroy(Request $request, $id)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        $event = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        // Only allow deleting draft events
        if ($event->is_published) {
            return response()->json([
                'message' => 'Cannot delete published events. Unpublish first.'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }

    /**
     * Publish event
     */
    public function publish(Request $request, $id)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        $event = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        if ($event->is_published) {
            return response()->json([
                'message' => 'Event is already published'
            ], 400);
        }

        $event->is_published = true;
        $event->published_at = now();
        $event->save();

        // Reload event with ngo relationship for broadcast
        $event->load('ngo:id,name,logo_url');

        // Broadcast event published for real-time updates
        broadcast(new \App\Events\EventPublished($event));

        return response()->json([
            'message' => 'Event published successfully',
            'event' => $event
        ]);
    }

    /**
     * Unpublish event
     */
    public function unpublish(Request $request, $id)
    {
        $ngo = $request->user()->ngo;

        if (!$ngo) {
            return response()->json([
                'message' => 'NGO profile not found'
            ], 404);
        }

        $event = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        if (!$event->is_published) {
            return response()->json([
                'message' => 'Event is already unpublished'
            ], 400);
        }

        $event->is_published = false;
        $event->save();

        return response()->json([
            'message' => 'Event unpublished successfully',
            'event' => $event
        ]);
    }
}
