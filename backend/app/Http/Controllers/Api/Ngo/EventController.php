<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventUnpublishRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;


use App\Events\EventStatusUpdated;

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
            ->with(['sections', 'unpublishRequests' => function($q) {
                $q->where('status', 'pending');
            }]);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by trashed status (Soft Delete)
        if ($request->has('trashed') && $request->trashed == 1) {
            $query->onlyTrashed();
        } else {
            // Filter by published status
            if ($request->has('is_published')) {
                $query->where('is_published', $request->is_published);
            }

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'completed') {
                    $query->where('is_published', true)
                          ->whereDate('end_date', '<', now()->toDateString());
                } else {
                    $query->where('status', $request->status);
                }
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortFields = ['created_at', 'updated_at', 'start_date', 'title', 'status'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->get('per_page', 10);
        $events = $query->paginate($perPage);

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
        $user = $request->user();

        // Allow Admin to view any event (Mainly for previewing/approval)
        if ($user->role === 'admin') {
             $event = Event::where('id', $id)
                ->with([
                    'sections',
                    'ngo' => function($query) {
                        $query->withCount('activeEvents');
                    },
                    'participantCategories',
                    'volunteerRoles' => function($query) {
                        $query->with(['shifts', 'roleType']);
                    },
                    'donationConfig'
                ])
                ->withTrashed() // Admins might need to see trashed events too? Maybe later.
                ->first();
        } else {
            // Normal NGO One
            $ngo = $user->ngo;

            if (!$ngo) {
                return response()->json([
                    'message' => 'NGO profile not found'
                ], 404);
            }

            $event = Event::where('id', $id)
                ->where('ngo_id', $ngo->id)
                ->with([
                    'sections',
                    'ngo' => function($query) {
                        $query->withCount('activeEvents');
                    },
                    'participantCategories',
                    'volunteerRoles' => function($query) {
                        $query->with(['shifts', 'roleType']);
                    },
                    'donationConfig'
                ])
                ->first();
        }

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

        if ($event->is_published) {
            return response()->json([
                'message' => 'Published events cannot be edited directly. Please request unpublish if changes are needed.'
            ], 403);
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

        if ($event->status === 'pending_approval') {
             return response()->json([
                'message' => 'Event is already pending approval'
            ], 400);
        }

        // Validate event readiness
        Log::info('Event Publish Check:', [
            'id' => $event->id,
            'start_date' => $event->start_date,
            'end_date' => $event->end_date,
            'address' => $event->address,
            'has_participant' => $event->has_participant,
            'has_volunteer' => $event->has_volunteer,
            'has_donation' => $event->has_donation
        ]);

        $missing = [];
        if (!$event->start_date) $missing[] = 'Start Date';
        if (!$event->end_date) $missing[] = 'End Date';
        
        // Address is required ONLY if it involves participants or volunteers
        if (($event->has_participant || $event->has_volunteer) && !$event->address) {
            $missing[] = 'Location (Address) - Required for events with Participants or Volunteers';
        }

        if (!empty($missing)) {
             return response()->json([
                'message' => 'Event details incomplete: ' . implode(', ', $missing) . ' missing.'
            ], 400);
        }

        $event->update([
            'is_published' => false,
            'status' => 'pending_approval',
            'published_at' => null
        ]);

        EventStatusUpdated::dispatch($event);

        return response()->json([
            'message' => 'Event submitted for approval',
            'event' => $event
        ]);
    }

    /**
     * Cancel publish request
     */
    public function cancelPublishRequest(Request $request, $id)
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

        if ($event->status !== 'pending_approval') {
            return response()->json([
                'message' => 'Event is not pending approval'
            ], 400);
        }

        $event->update([
            'status' => 'open', // Revert to draft/open state
            'is_published' => false,
        ]);

        EventStatusUpdated::dispatch($event);

        return response()->json([
            'message' => 'Publish request cancelled. Event is now in draft.',
            'event' => $event
        ]);
    }

    /**
     * Unpublish event (Request to Admin)
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

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if there is already a pending request
        $existingRequest = EventUnpublishRequest::where('event_id', $event->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'A request to unpublish this event is already pending admin approval.'
            ], 400);
        }

        EventUnpublishRequest::create([
            'event_id' => $event->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        // Notify Admin via WebSocket
        EventStatusUpdated::dispatch($event);

        return response()->json([
            'message' => 'Unpublish request submitted. Admin will review your request.',
        ]);
    }

    /**
     * Cancel unpublish request
     */
    public function cancelUnpublishRequest(Request $request, $id)
    {
        $ngo = $request->user()->ngo;
        if (!$ngo) return response()->json(['message' => 'NGO profile not found'], 404);

        $event = Event::where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) return response()->json(['message' => 'Event not found'], 404);

        $unpublishRequest = EventUnpublishRequest::where('event_id', $event->id)
            ->where('status', 'pending')
            ->first();

        if (!$unpublishRequest) {
            return response()->json([
                'message' => 'No pending unpublish request found for this event.'
            ], 404);
        }

        $unpublishRequest->delete(); // Or update status to 'cancelled' if soft deletes used (not used here)
        
        // Notify Admin via WebSocket
        EventStatusUpdated::dispatch($event);

        return response()->json([
            'message' => 'Unpublish request cancelled.',
        ]);
    }
    /**
     * Restore trashed event
     */
    public function restore(Request $request, $id)
    {
        $ngo = $request->user()->ngo;
        if (!$ngo) return response()->json(['message' => 'NGO profile not found'], 404);

        $event = Event::onlyTrashed()
            ->where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) return response()->json(['message' => 'Event not found in trash'], 404);

        $event->restore();

        return response()->json(['message' => 'Event restored successfully']);
    }

    /**
     * Permanently delete event
     */
    public function forceDelete(Request $request, $id)
    {
        $ngo = $request->user()->ngo;
        if (!$ngo) return response()->json(['message' => 'NGO profile not found'], 404);

        $event = Event::withTrashed()
            ->where('id', $id)
            ->where('ngo_id', $ngo->id)
            ->first();

        if (!$event) return response()->json(['message' => 'Event not found'], 404);

        // Manually delete relations to prevent FK constraint errors
        // (Since model hooks seem to be failing or race-condition prone)
        
        // 1. Delete simple relations
        $event->sections()->delete();
        $event->registrationLinks()->delete();
        $event->reviews()->delete();
        $event->unpublishRequests()->delete();

        // 2. Models that might not use SoftDeletes (Hard delete them)
        if ($event->donationConfig) {
            $event->donationConfig()->delete();
        }
        if ($event->participantConfig) {
            $event->participantConfig()->delete();
        }

        // 3. Complex relations (Volunteer Roles -> Shifts)
        // VolunteerRole does NOT use SoftDeletes, so we fetch normally.
        $event->volunteerRoles()->each(function($role) {
            $role->shifts()->delete(); // Shifts don't use SD (assumed based on pattern)
            $role->registrations()->withTrashed()->forceDelete(); // Regs use SD
            $role->delete(); // Hard delete role
        });
        $event->volunteerRegistrations()->withTrashed()->forceDelete();

        // 4. Participant Categories -> Tiers
        // ParticipantCategory does NOT use SoftDeletes
        $event->participantCategories()->each(function($category) {
            if (method_exists($category, 'tiers')) {
                 $category->tiers()->delete();
            } else if (method_exists($category, 'feeTiers')) {
                 $category->feeTiers()->delete();
            }
            $category->delete(); // Hard delete category
        });
        
        // 5. Registrations (These define the FK constraints blocking us)
        $event->participantRegistrations()->withTrashed()->chunk(100, function($regs) {
            foreach ($regs as $reg) {
                // Manually delete foreign key constraints if models don't handle it
                \Illuminate\Support\Facades\DB::table('payment_constraints')
                    ->where('participant_registration_id', $reg->id)
                    ->delete();
                    
                $reg->payments()->delete();
                $reg->forceDelete();
            }
        });

        $event->donationRegistrations()->withTrashed()->chunk(100, function($regs) {
             foreach ($regs as $reg) {
                \Illuminate\Support\Facades\DB::table('payment_constraints')
                    ->where('donation_registration_id', $reg->id)
                    ->delete();

                $reg->payments()->delete();
                $reg->forceDelete();
            }
        });

        $event->forceDelete();

        return response()->json(['message' => 'Event permanently deleted']);
    }
}
