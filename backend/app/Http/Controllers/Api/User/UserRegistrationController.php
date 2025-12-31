<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserRegistrationController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // Get participant registrations with all relationships
        $participantRegistrations = ParticipantRegistration::where('user_id', $userId)
            ->with(['event.ngo', 'participantCategory', 'payments', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();


        // Get volunteer registrations with all relationships
        $volunteerRegistrations = VolunteerRegistration::where('user_id', $userId)
            ->with(['event.ngo', 'volunteerRole', 'volunteerShift', 'payments', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get payments with full payable relationships
        $payments = Payment::where('user_id', $userId)
            ->with([
                'payable.event.ngo',
                'payable.participantCategory',
                'payable.user'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'participant_registrations' => $participantRegistrations,
            'volunteer_registrations' => $volunteerRegistrations,
            'payments' => $payments,
        ]);
    }
}
