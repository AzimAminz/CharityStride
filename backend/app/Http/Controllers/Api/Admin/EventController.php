<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Mail;
use App\Mail\EventPublishedMail;
use App\Mail\EventUnpublishedMail;
use App\Mail\EventTakenDownMail;
use App\Events\EventStatusUpdated;

class EventController extends Controller
{
    /**
     * List all events for admin
     */
    public function index(Request $request)
    {
        $query = Event::with(['ngo:id,name,logo_url'])
            ->withCount(['participantRegistrations', 'volunteerRegistrations']);

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $events = $query->latest()->paginate(10);

        return response()->json($events);
    }

    /**
     * Approve event
     */
    public function approve($id)
    {
        $event = Event::with('ngo.user')->findOrFail($id);

        $event->update([
            'status' => 'open',
            'is_published' => true,
            'published_at' => now(),
        ]);

        EventStatusUpdated::dispatch($event);

        // Send Email
        try {
            // Explicitly load NGO and User to avoid relation partial loading issues
            $ngo = \App\Models\Ngo::with('user')->find($event->ngo_id);
            
            \Illuminate\Support\Facades\Log::info('Debug Mail Data (Explicit)', [
                'event_id' => $event->id,
                'ngo_id' => $ngo?->id,
                'ngo_contact_email' => $ngo?->contact_email,
                'user_id' => $ngo?->user?->id,
                'user_email' => $ngo?->user?->email
            ]);

            $recipients = array_filter([
                $ngo->contact_email ?? null,
                $ngo->user->email ?? null
            ]);
            
            if (!empty($recipients)) {
                Mail::to($recipients)->send(new EventPublishedMail($event));
                \Illuminate\Support\Facades\Log::info('EventPublishedMail sent successfully');
            } else {
                \Illuminate\Support\Facades\Log::warning('No recipients found for EventPublishedMail');
            }
        } catch (\Exception $e) {
            Log::error('Mail Error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Event approved and published successfully',
            'event' => $event
        ]);
    }

    /**
     * Reject event
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|min:5'
        ]);

        $event = Event::findOrFail($id);

        $event->update([
            'status' => 'rejected',
            'is_published' => false,
            // You might want to store the rejection reason in a separate field or table if needed
             'take_down_reason' => $request->reason, // Reusing this field or create a new one 'rejection_reason'
        ]);

        EventStatusUpdated::dispatch($event);

        return response()->json([
            'message' => 'Event rejected',
            'event' => $event
        ]);
    }
    /**
     * Take down event (Ban/Suspend)
     */
    public function takeDown(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|min:5'
        ]);

        $event = Event::with('ngo.user')->findOrFail($id);

        $event->update([
            'status' => 'taken_down',
            'is_published' => false,
            'taken_down_at' => now(),
            'take_down_reason' => $request->reason,
        ]);

        EventStatusUpdated::dispatch($event);

        // Send Email
        try {
            $ngo = \App\Models\Ngo::with('user')->find($event->ngo_id);
            $recipients = array_filter([
                $ngo->contact_email ?? null,
                $ngo->user->email ?? null
            ]);
            if (!empty($recipients)) {
                Mail::to($recipients)->send(new EventTakenDownMail($event, $request->reason));
            }
        } catch (\Exception $e) {
            Log::error('Mail Error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Event has been taken down.',
            'event' => $event
        ]);
    }

    /**
     * List unpublish requests
     */
    public function unpublishRequests(Request $request)
    {
        $requests = \App\Models\EventUnpublishRequest::where('status', 'pending')
            ->with(['event.ngo'])
            ->latest()
            ->paginate(10);

        return response()->json($requests);
    }

    /**
     * Approve unpublish request
     */
    public function approveUnpublish($id)
    {
        $unpublishRequest = \App\Models\EventUnpublishRequest::with('event.ngo.user')->findOrFail($id);
        
        if ($unpublishRequest->status !== 'pending') {
             return response()->json(['message' => 'Request already processed'], 400);
        }

        $event = $unpublishRequest->event;
        
        // Update Event
        $event->update([
            'is_published' => false,
            'status' => 'open', // Revert to draft
            'published_at' => null,
        ]);

        // Update Request
        $unpublishRequest->update([
            'status' => 'approved',
            'processed_at' => now(),
        ]);

        EventStatusUpdated::dispatch($event);

        // Send Email
        try {
             $ngo = \App\Models\Ngo::with('user')->find($event->ngo_id);
            $recipients = array_filter([
                $ngo->contact_email ?? null,
                $ngo->user->email ?? null
            ]);
            if (!empty($recipients)) {
                Mail::to($recipients)->send(new EventUnpublishedMail($event));
            }
        } catch (\Exception $e) {
            Log::error('Mail Error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Event unpublished successfully.',
            'event' => $event
        ]);
    }

    /**
     * Reject unpublish request
     */
    public function rejectUnpublish(Request $request, $id)
    {
        $unpublishRequest = \App\Models\EventUnpublishRequest::with('event')->findOrFail($id);

         if ($unpublishRequest->status !== 'pending') {
             return response()->json(['message' => 'Request already processed'], 400);
        }

        $request->validate([
            'admin_note' => 'required|string|min:5'
        ]);

        // Request rejected, event stays published
        $unpublishRequest->update([
            'status' => 'rejected',
            'admin_note' => $request->admin_note,
            'processed_at' => now(),
        ]);
        
        // Optional: Notify NGO via EventStatusUpdated or other channel
        EventStatusUpdated::dispatch($unpublishRequest->event);

        return response()->json([
            'message' => 'Unpublish request rejected.',
        ]);
    }
}
