<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\VolunteerShift;
use App\Models\VolunteerRegistration;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class VolunteerRegistrationController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'volunteer_role_id' => 'required|exists:volunteer_roles,id',
            'volunteer_shift_id' => 'required|exists:volunteer_shifts,id',
            'experience_level' => 'nullable|string|max:50',
            'tshirt_size' => 'nullable|string|max:10',
            'availability_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. Validate Event & Shift
        $event = Event::findOrFail($eventId);
        if (!$event->is_published) {
            return response()->json(['message' => 'Event is not open for registration'], 403);
        }

        $shift = VolunteerShift::findOrFail($request->volunteer_shift_id);
        $shift = VolunteerShift::findOrFail($request->volunteer_shift_id);

        // 2. Check Capacity
        if ($shift->capacity) {
            $currentCount = VolunteerRegistration::where('volunteer_shift_id', $shift->id)
                ->whereIn('status', ['confirmed', 'pending_payment'])
                ->count();
                
            if ($currentCount >= $shift->capacity) {
                return response()->json(['message' => 'Shift is fully booked'], 400);
            }
        }

        // 3. Check for existing registration
        $existing = VolunteerRegistration::where('event_id', $eventId)
            ->where('user_id', Auth::id())
            ->where('volunteer_shift_id', $shift->id)
            ->whereIn('status', ['confirmed', 'pending_payment'])
            ->first();

        if ($existing) {
            if ($existing->status === 'pending_payment') {
                $payment = $existing->payments()->where('payment_status', 'pending')->latest()->first();
                if ($payment) {
                    return response()->json([
                        'message' => 'You have a pending registration waiting for payment.',
                        'payment_id' => $payment->id,
                        'registration_id' => $existing->id
                    ]);
                }
            }
            return response()->json(['message' => 'You are already registered for this shift.'], 400);
        }

        // 4. Calculate Fee
        $feeAmount = 0;
        $role = $shift->volunteerRole;
        
        if ($role && $role->has_fee) {
            $feeAmount = $role->fee_amount ?? 0;
        }

        DB::beginTransaction();
        try {
            // 5. Create Registration
            $registration = VolunteerRegistration::create([
                'event_id' => $eventId,
                'user_id' => Auth::id(),
                'volunteer_role_id' => $request->volunteer_role_id,
                'volunteer_shift_id' => $request->volunteer_shift_id,
                'experience_level' => $request->experience_level,
                'tshirt_size' => $request->tshirt_size,
                'availability_notes' => $request->availability_notes,
                'status' => $feeAmount > 0 ? 'pending' : 'approved',
                'qr_code' => 'VOL-' . strtoupper(Str::random(12)),
            ]);

            // 6. Create Payment if fee exists
            $payment = null;
            if ($feeAmount > 0) {
                $payment = Payment::create([
                    'user_id' => Auth::id(),
                    'payable_type' => VolunteerRegistration::class,
                    'payable_id' => $registration->id,
                    'amount' => $feeAmount,
                    'payment_method' => 'unspecified',
                    'payment_status' => 'pending',
                    'payment_reference' => 'VOL-' . strtoupper(Str::random(10)),
                ]);
            } else {
                // If free, send confirmation email with QR code
                try {
                    \Mail::to($registration->user->email)->send(new \App\Mail\RegistrationConfirmation($registration));
                    
                    // Broadcast registration event
                    broadcast(new \App\Events\RegistrationCreated($event, 'volunteer'));
                } catch (\Exception $emailError) {
                    \Log::error('Failed to send volunteer registration email: ' . $emailError->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Volunteer registration successful',
                'registration' => $registration->load(['user', 'volunteerRole', 'volunteerShift']),
                'payment_id' => $payment?->id,
                'requires_payment' => $feeAmount > 0,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Volunteer registration error: ' . $e->getMessage());
            return response()->json(['message' => 'Registration failed. Please try again.'], 500);
        }
    }
}
