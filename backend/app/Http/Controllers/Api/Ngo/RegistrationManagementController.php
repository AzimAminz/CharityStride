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
                ->with(['user', 'participantCategory', 'payments'])
                ->get();

            $volunteers = VolunteerRegistration::where('event_id', $eventId)
                ->with(['user', 'volunteerRole.roleType', 'volunteerShift'])
                ->get();

            // Get donations if donation module is enabled
            $donations = [];
            if ($event->donationConfig) {
                $donations = \App\Models\DonationRegistration::where('event_id', $eventId)
                    ->with(['user', 'payments'])
                    ->get();
            }

            return response()->json([
                'participants' => $participants,
                'volunteers' => $volunteers,
                'donations' => $donations,
                'stats' => [
                    'total_registrations' => $participants->count() + $volunteers->count() + count($donations),
                    'participants_checked_in' => $participants->where('attendance_status', 'checked_in')->count(),
                    'volunteers_checked_in' => $volunteers->where('attendance_status', 'checked_in')->count(),
                    'tshirts_collected' => $participants->where('tshirt_collected', true)->count() + $volunteers->where('tshirt_collected', true)->count(),
                    'total_donations' => count($donations),
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

            return response()->json(['message' => 'QR code not found or does not belong to your NGO'], 404);

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

            if ($registration->attendance_status === 'checked_in') {
                return response()->json(['message' => 'Already checked in', 'registration' => $registration], 200);
            }

            $registration->update([
                'attendance_status' => 'checked_in',
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
                $updates['attendance_status'] = $request->attendance ? 'checked_in' : 'absent';
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
        }

        return response()->json([
            'message' => 'Registration updated',
            'registration' => $registration->fresh()
        ]);
    }
}
