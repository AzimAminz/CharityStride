<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use App\Models\DonationRegistration;
use Illuminate\Http\Request;

class RegistrationStatusController extends Controller
{
    /**
     * Check user's registration status for a specific event
     * Returns what modules the user has registered for and which volunteer shifts
     */
    public function checkStatus($eventId)
    {
        $userId = auth()->id();
        
        // Check participant registration
        $participantRegistration = ParticipantRegistration::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->first();
            
        // Check volunteer registration with shifts
        $volunteerRegistrations = VolunteerRegistration::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->with('volunteerShift')
            ->get();
            
        // Check donation registration  
        $donationRegistration = DonationRegistration::where('event_id', $eventId)
            ->where('user_id', $userId)
            ->first();
            
        return response()->json([
            'has_participant_registration' => !!$participantRegistration,
            'has_volunteer_registration' => $volunteerRegistrations->isNotEmpty(),
            'has_donation_registration' => !!$donationRegistration,
            'registered_volunteer_shift_ids' => $volunteerRegistrations->pluck('volunteer_shift_id')->toArray(),
            'participant_registration' => $participantRegistration,
            'volunteer_registrations' => $volunteerRegistrations,
            'donation_registration' => $donationRegistration,
        ]);
    }
}
