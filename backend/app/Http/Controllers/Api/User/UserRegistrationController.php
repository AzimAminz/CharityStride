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

        $participantRegistrations = ParticipantRegistration::where('user_id', $userId)
            ->with(['event', 'participantCategory', 'feeTier', 'payments' => function($q) {
                $q->latest();
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $volunteerRegistrations = VolunteerRegistration::where('user_id', $userId)
            ->with(['event', 'volunteerRole', 'volunteerShift'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Also fetch standalone payments (donations etc)
        $payments = Payment::where('user_id', $userId)
            ->with(['payable'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'participant_registrations' => $participantRegistrations,
            'volunteer_registrations' => $volunteerRegistrations,
            'payments' => $payments
        ]);
    }
}
