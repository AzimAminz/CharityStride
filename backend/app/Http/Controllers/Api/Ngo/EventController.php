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
            ->with(['sections'])  // images is JSON field in sections, not a relationship
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        return response()->json($event);
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
            'status' => 'in:open,closed,completed',
            'thumbnail' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $event->update($request->only([
            'title',
            'description',
            'has_volunteer',
            'has_donation',
            'has_participant',
            'start_date',
            'end_date',
            'status',
            'thumbnail',
        ]));

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
        $event->save();

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
