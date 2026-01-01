<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\DonationRegistration;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DonationRegistrationController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'amount_paid' => 'required|integer|min:100', // Minimum 100 cents (RM1)
            'payment_method' => 'nullable|string',
            'payment_gateway' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. Validate Event
        $event = Event::findOrFail($eventId);
        if (!$event->is_published) {
            return response()->json(['message' => 'Event is not open for donations'], 403);
        }

        // Check if event has donation module enabled
        if (!$event->has_donation) {
            return response()->json(['message' => 'This event does not accept donations'], 403);
        }

        // 2. Create Donation Registration & Payment (Transaction)
        try {
            DB::beginTransaction();

            // Create Registration
            $registration = DonationRegistration::create([
                'event_id' => $eventId,
                'user_id' => Auth::id(),
                'amount_paid' => $request->amount_paid,
            ]);

            // Create Payment Record
            $paymentMethod = $request->payment_method ?? 'unspecified';
            $paymentGateway = $request->payment_gateway ?? 'mock_gateway';
            
            $payment = $registration->payments()->create([
                'user_id' => Auth::id(),
                'amount' => $request->amount_paid,
                'currency' => 'MYR',
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending',
                'payment_reference' => 'DON-' . strtoupper(uniqid()),
                'payment_gateway' => $paymentGateway,
            ]);

            // Link to PaymentConstraint (One-to-One enforcement)
            \App\Models\PaymentConstraint::create([
                'payment_id' => $payment->id,
                'donation_registration_id' => $registration->id
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Donation initiated. Please complete payment.',
                'registration' => $registration,
                'payment_id' => $payment->id,
                'requires_payment' => true,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Donation registration failed: ' . $e->getMessage());
            return response()->json(['message' => 'Donation registration failed: ' . $e->getMessage()], 500);
        }
    }
}
