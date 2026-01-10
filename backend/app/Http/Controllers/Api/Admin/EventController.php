<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        $event = Event::findOrFail($id);

        $event->update([
            'status' => 'open',
            'is_published' => true,
            'published_at' => now(),
        ]);

        EventStatusUpdated::dispatch($event);

        // You might want to send a notification to the NGO here

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
}
