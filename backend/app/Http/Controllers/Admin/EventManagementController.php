<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventUnpublishRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EventManagementController extends Controller
{
    /**
     * List all events with filters
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status'); // 'published', 'draft', 'deleted'
        $perPage = $request->query('per_page', 10);

        $query = Event::with(['ngo:id,name,registration_no']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('ngo', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status === 'published') {
            $query->where('is_published', true)->whereNull('deleted_at')->whereNull('taken_down_at');
        } elseif ($status === 'taken_down') {
            $query->whereNotNull('taken_down_at');
        } else {
            // By default, show only published events (exclude drafts and taken down)
            $query->where('is_published', true)->whereNull('taken_down_at');
        }

        $events = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'total' => $events->total(),
                'per_page' => $events->perPage(),
                'last_page' => $events->lastPage(),
            ]
        ]);
    }

    /**
     * List unpublish requests from NGOs
     */
    public function unpublishRequests(Request $request)
    {
        $status = $request->query('status', 'pending');
        $perPage = $request->query('per_page', 10);

        $requests = EventUnpublishRequest::with(['event', 'event.ngo'])
            ->where('status', $status)
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'data' => $requests->items(),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'total' => $requests->total(),
                'per_page' => $requests->perPage(),
                'last_page' => $requests->lastPage(),
            ]
        ]);
    }

    /**
     * Admin Force Unpublish / Take down
     */
    public function unpublish(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:1000'
        ]);

        $event = Event::with('ngo.user')->findOrFail($id);
        
        $event->update([
            'is_published' => false,
            'taken_down_at' => Carbon::now(),
            'take_down_reason' => $request->reason
        ]);

        // Send email notification to NGO owner (user email)
        \Mail::to($event->ngo->user->email)->send(
            new \App\Mail\EventTakenDownMail($event, $request->reason)
        );

        return response()->json([
            'message' => 'Event has been taken down successfully and NGO has been notified.',
            'event' => $event
        ]);
    }

    /**
     * Process Unpublish Request (Approve/Reject)
     */
    public function processUnpublishRequest(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:500'
        ]);

        $unpublishReq = EventUnpublishRequest::findOrFail($id);
        $event = $unpublishReq->event;

        DB::transaction(function() use ($unpublishReq, $event, $request) {
            $unpublishReq->update([
                'status' => $request->status,
                'admin_note' => $request->admin_note,
                'processed_at' => Carbon::now()
            ]);

            if ($request->status === 'approved') {
                $event->update(['is_published' => false]);
            }
        });

        return response()->json([
            'message' => 'Unpublish request has been ' . $request->status . '.',
            'data' => $unpublishReq->load('event')
        ]);
    }
}
