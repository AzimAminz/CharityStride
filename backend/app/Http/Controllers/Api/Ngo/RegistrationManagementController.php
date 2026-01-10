<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RegistrationManagementController extends Controller
{
    /**
     * Get all registrations for an event
     */
    public function getEventRegistrations($eventId)
    {
        try {
            $user = Auth::user();
            
            // Get NGO ID from user.ngo_id or from ngos table
            $ngoId = $user->ngo_id;
            
            if (!$ngoId) {
                // Try to get NGO from ngos table using user_id
                $ngo = \App\Models\Ngo::where('user_id', $user->id)->first();
                if ($ngo) {
                    $ngoId = $ngo->id;
                } else {
                    return response()->json(['message' => 'User is not associated with an NGO'], 403);
                }
            }

            $event = Event::where('ngo_id', $ngoId)->findOrFail($eventId);

            $participants = ParticipantRegistration::where('event_id', $eventId)
                ->where('status', 'confirmed')
                ->with(['user', 'participantCategory', 'payments'])
                ->get();

            $volunteers = VolunteerRegistration::where('event_id', $eventId)
                ->where('status', 'approved')
                ->with(['user', 'volunteerRole.roleType', 'volunteerShift'])
                ->get();

            // Get donations (only paid ones)
            $donations = \App\Models\DonationRegistration::where('event_id', $eventId)
                ->whereHas('payments', function($q) {
                    $q->where('payment_status', 'paid');
                })
                ->with(['user', 'payments'])
                ->get();

            // Calculate total revenue (confirmed participants + paid donations)
            $totalRevenue = $participants->where('status', 'confirmed')->sum('amount_paid') / 100;
            $totalRevenue += \App\Models\Payment::whereHas('payable', function($q) use ($eventId) {
                    $q->where('event_id', $eventId);
                })
                ->where('payable_type', \App\Models\DonationRegistration::class)
                ->where('payment_status', 'paid')
                ->sum('amount') / 100;

            return response()->json([
                'event' => $event,
                'participants' => $participants,
                'volunteers' => $volunteers,
                'donations' => $donations,
                'stats' => [
                    'total_registrations' => $participants->count() + $volunteers->count() + $donations->count(),
                    'participants_count' => $participants->count(),
                    'volunteers_count' => $volunteers->count(),
                    'donations_count' => $donations->count(),
                    'participants_checked_in' => $participants->whereIn('attendance_status', ['checked_in', 'completed', 'checked_out'])->count(),
                    'volunteers_checked_in' => $volunteers->whereIn('attendance_status', ['checked_in', 'completed', 'checked_out'])->count(),
                    'tshirts_collected' => $participants->where('tshirt_collected', true)->count() + $volunteers->where('tshirt_collected', true)->count(),
                    'total_revenue' => round($totalRevenue, 2),
                ]
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Event not found or unauthorized: ' . $eventId);
            return response()->json(['message' => 'Event not found or unauthorized'], 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching registrations: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching registrations: ' . $e->getMessage()], 500);
        }
    }
    /**
     * Verify QR code and return registration details without checking in
     * QR codes are unique, so we search across all NGO events
     */
    public function verifyQR(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        try {
            // Get NGO ID
            $user = Auth::user();
            $ngoId = $user->ngo_id ?? \App\Models\Ngo::where('user_id', $user->id)->value('id');
            
            if (!$ngoId) {
                return response()->json(['message' => 'User is not associated with an NGO'], 403);
            }

            // Search in participant registrations across all NGO events
            $participant = ParticipantRegistration::where('qr_code', $request->qr_code)
                ->whereHas('event', function($query) use ($ngoId) {
                    $query->where('ngo_id', $ngoId);
                })
                ->with(['user', 'participantCategory', 'payments', 'event'])
                ->first();

            if ($participant) {
                return response()->json([
                    'type' => 'participant',
                    'registration' => $participant,
                    'event' => $participant->event,
                    'message' => 'Participant found'
                ]);
            }

            // Search in volunteer registrations across all NGO events
            $volunteer = VolunteerRegistration::where('qr_code', $request->qr_code)
                ->whereHas('event', function($query) use ($ngoId) {
                    $query->where('ngo_id', $ngoId);
                })
                ->with(['user', 'volunteerRole.roleType', 'volunteerShift', 'payments', 'event'])
                ->first();

            if ($volunteer) {
                return response()->json([
                    'type' => 'volunteer',
                    'registration' => $volunteer,
                    'event' => $volunteer->event,
                    'message' => 'Volunteer found'
                ]);
            }

            return response()->json(['message' => 'Invalid or unauthorized QR code'], 404);

        } catch (\Exception $e) {
            \Log::error('QR verification error: ' . $e->getMessage());
            return response()->json(['message' => 'Verification failed'], 500);
        }
    }


    /**
     * Check-in by QR code
     */
        public function checkInByQr(Request $request, $eventId)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'type' => 'required|in:participant,volunteer',
        ]);

        // Get NGO ID
        $user = Auth::user();
        $ngoId = $user->ngo_id ?? \App\Models\Ngo::where('user_id', $user->id)->value('id');
        
        if (!$ngoId) {
            return response()->json(['message' => 'User is not associated with an NGO'], 403);
        }

        // Verify event belongs to NGO
        Event::where('ngo_id', $ngoId)->findOrFail($eventId);

        if ($request->type === 'participant') {
            $registration = ParticipantRegistration::where('qr_code', $request->qr_code)
                ->where('event_id', $eventId)
                ->with(['user', 'participantCategory'])
                ->firstOrFail();

            if ($registration->attendance_status === 'completed' || $registration->attendance_status === 'checked_in') {
                return response()->json(['message' => 'Attendance already recorded', 'registration' => $registration], 200);
            }

            $registration->update([
                'attendance_status' => 'completed',
                'check_in_time' => now(),
                'verified_by_user_id' => Auth::id(),
            ]);
        } else {
            $registration = VolunteerRegistration::where('qr_code', $request->qr_code)
                ->where('event_id', $eventId)
                ->with(['user', 'volunteerRole', 'volunteerShift'])
                ->firstOrFail();

            if ($registration->attendance_status === 'checked_in') {
                return response()->json(['message' => 'Already checked in', 'registration' => $registration], 200);
            }

            $registration->update([
                'attendance_status' => 'checked_in',
                'check_in_time' => now(),
                'attendance_marked' => true,
                'verified_by_user_id' => Auth::id(),
            ]);
        }

        return response()->json([
            'message' => 'Check-in successful',
            'registration' => $registration->fresh(['user', $request->type === 'participant' ? 'participantCategory' : 'volunteerRole'])
        ]);
    }

    /**
     * Check-out by QR code (volunteers only)
     */
    public function checkOutByQr(Request $request, $eventId)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'type' => 'nullable|in:participant,volunteer',
        ]);

        // Get NGO ID
        $user = Auth::user();
        $ngoId = $user->ngo_id ?? \App\Models\Ngo::where('user_id', $user->id)->value('id');
        
        if (!$ngoId) {
            return response()->json(['message' => 'User is not associated with an NGO'], 403);
        }

        // Verify event belongs to NGO
        Event::where('ngo_id', $ngoId)->findOrFail($eventId);

        // Detect type if not provided
        $type = $request->type;
        if (!$type) {
            if (str_starts_with($request->qr_code, 'PAR-')) $type = 'participant';
            else if (str_starts_with($request->qr_code, 'VOL-')) $type = 'volunteer';
        }

        if ($type === 'participant') {
            $registration = ParticipantRegistration::where('qr_code', $request->qr_code)
                ->where('event_id', $eventId)
                ->with(['user', 'participantCategory'])
                ->firstOrFail();
        } else {
            $registration = VolunteerRegistration::where('qr_code', $request->qr_code)
                ->where('event_id', $eventId)
                ->with(['user', 'volunteerRole', 'volunteerShift'])
                ->firstOrFail();
        }

        if ($registration->attendance_status === 'completed' || $registration->attendance_status === 'checked_out') {
            return response()->json(['message' => 'Already checked out', 'registration' => $registration], 200);
        }

        if ($registration->attendance_status !== 'checked_in') {
            return response()->json(['message' => 'Must be checked in first'], 400);
        }

        // Validate current time is >= shift end time (only for volunteers with shifts)
        if ($type === 'volunteer' && $registration->volunteerShift) {
            $shift = $registration->volunteerShift;
            $now = now();
            $shiftEndDateTime = \Carbon\Carbon::parse($shift->shift_date->toDateString() . ' ' . $shift->end_time);

            if ($now->lt($shiftEndDateTime)) {
                return response()->json([
                    'message' => 'Check-out not allowed yet. Shift ends at ' . $shiftEndDateTime->format('d M Y, h:i A'),
                    'can_check_out' => false
                ], 400);
            }
        }

        // Calculate hours
        $checkInTime = $registration->check_in_time;
        $checkOutTime = now();
        
        // Use absolute difference and ensure it's positive
        // Carbon's diffInMinutes returns the absolute difference if the second parameter is true
        $minutes = $checkInTime ? $checkOutTime->diffInMinutes($checkInTime, true) : 0;
        $hours = $minutes / 60;

        $registration->update([
            'attendance_status' => 'completed',
            'check_out_time' => $checkOutTime,
            'total_hours' => round($hours, 2),
            'verified_by_user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Check-out successful. Total hours: ' . round($hours, 2),
            'registration' => $registration->fresh(['user', $type === 'participant' ? 'participantCategory' : 'volunteerRole'])
        ]);
    }

    /**
     * Mark t-shirt collected
     */
    public function collectTshirt(Request $request, $eventId)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'type' => 'required|in:participant,volunteer',
        ]);

        // Verify event belongs to NGO
        Event::where('ngo_id', Auth::user()->ngo_id)->findOrFail($eventId);

        if ($request->type === 'participant') {
            $registration = ParticipantRegistration::where('qr_code', $request->qr_code)
                ->where('event_id', $eventId)
                ->with(['user', 'participantCategory'])
                ->firstOrFail();

            // Check if category has t-shirt
            if (!$registration->participantCategory->has_tshirt) {
                return response()->json(['error' => 'This category does not have t-shirt'], 400);
            }

            if ($registration->tshirt_collected) {
                return response()->json(['message' => 'T-shirt already collected', 'registration' => $registration], 200);
            }

            $registration->update([
                'tshirt_collected' => true,
                'tshirt_collected_at' => now(),
                'verified_by_user_id' => Auth::id(),
            ]);
        } else {
            $registration = VolunteerRegistration::where('qr_code', $request->qr_code)
                ->where('event_id', $eventId)
                ->with(['user', 'volunteerRole'])
                ->firstOrFail();

            // Check if role has t-shirt
            if (!$registration->volunteerRole->has_tshirt) {
                return response()->json(['error' => 'This role does not have t-shirt'], 400);
            }

            if ($registration->tshirt_collected) {
                return response()->json(['message' => 'T-shirt already collected', 'registration' => $registration], 200);
            }

            $registration->update([
                'tshirt_collected' => true,
                'tshirt_collected_at' => now(),
                'verified_by_user_id' => Auth::id(),
            ]);
        }

        return response()->json([
            'message' => 'T-shirt collection marked',
            'registration' => $registration->fresh()
        ]);
    }

    /**
     * Manual verification (update attendance and/or t-shirt)
     */
    public function manualVerify(Request $request, $eventId, $registrationId)
    {
        $request->validate([
            'type' => 'required|in:participant,volunteer',
            'attendance' => 'nullable|boolean',
            'tshirt' => 'nullable|boolean',
        ]);

        // Verify event belongs to NGO
        Event::where('ngo_id', Auth::user()->ngo_id)->findOrFail($eventId);

        if ($request->type === 'participant') {
            $registration = ParticipantRegistration::where('event_id', $eventId)
                ->findOrFail($registrationId);

            $updates = [];
            if ($request->has('attendance')) {
                $updates['attendance_status'] = $request->attendance ? 'completed' : 'absent';
                $updates['check_in_time'] = $request->attendance ? now() : null;
            }
            if ($request->has('tshirt') && $registration->participantCategory->has_tshirt) {
                $updates['tshirt_collected'] = $request->tshirt;
                $updates['tshirt_collected_at'] = $request->tshirt ? now() : null;
            }
            $updates['verified_by_user_id'] = Auth::id();

            $registration->update($updates);
        } else {
            $registration = VolunteerRegistration::where('event_id', $eventId)
                ->findOrFail($registrationId);

            $updates = [];
            if ($request->has('attendance')) {
                $updates['attendance_status'] = $request->attendance ? 'checked_in' : 'absent';
                $updates['check_in_time'] = $request->attendance ? now() : null;
                $updates['attendance_marked'] = true;
            }
            if ($request->has('tshirt') && $registration->volunteerRole->has_tshirt) {
                $updates['tshirt_collected'] = $request->tshirt;
                $updates['tshirt_collected_at'] = $request->tshirt ? now() : null;
            }
            $updates['verified_by_user_id'] = Auth::id();

            $registration->update($updates);

            // If we checked out, calculate hours
            if (isset($updates['attendance_status']) && $updates['attendance_status'] === 'completed') {
                $checkInTime = $registration->check_in_time;
                $checkOutTime = $registration->check_out_time;
                if ($checkInTime && $checkOutTime) {
                    $minutes = $checkOutTime->diffInMinutes($checkInTime, true);
                    $registration->update(['total_hours' => round($minutes / 60, 2)]);
                }
            }
        }

        return response()->json([
            'message' => 'Registration updated',
            'registration' => $registration->fresh()
        ]);
    }
}
