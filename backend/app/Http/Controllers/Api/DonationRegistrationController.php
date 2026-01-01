<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\DonationRegistration;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\DonationReceipt;
use Illuminate\Support\Facades\Validator;

class DonationRegistrationController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'donation_type' => 'required|in:money,item',
            'amount_paid' => 'required_if:donation_type,money|integer|min:1',
            'item_name' => 'required_if:donation_type,item|string|max:255',
            'quantity' => 'required_if:donation_type,item|integer|min:1',
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

            $donationType = $request->donation_type;
            $status = ($donationType === 'money') ? 'pending_payment' : 'confirmed';

            // Prepare registration data
            $registrationData = [
                'event_id' => $eventId,
                'user_id' => Auth::id(),
                'donation_type' => $donationType,
            ];

            if ($donationType === 'money') {
                $registrationData['amount_paid'] = $request->amount_paid; // In cents
                $registrationData['item_name'] = null;
                $registrationData['quantity'] = null;
            } else {
                $registrationData['amount_paid'] = null;
                $registrationData['item_name'] = $request->item_name;
                $registrationData['quantity'] = $request->quantity;
            }

            $registration = DonationRegistration::create($registrationData);

            $paymentId = null;

            if ($donationType === 'money') {
                // Create payment record for money donation
                $payment = $registration->payments()->create([
                    'user_id' => Auth::id(),
                    'amount' => $request->amount_paid, // In cents
                    'currency' => 'MYR',
                    'payment_method' => 'unspecified',
                    'payment_status' => 'pending',
                    'payment_reference' => 'DON-' . strtoupper(uniqid()),
                    'payment_gateway' => 'mock_gateway',
                ]);

                $paymentId = $payment->id;
            } else {
                // Item donation - no payment needed, send email immediately
                try {
                    Mail::to($registration->user->email)->send(new DonationReceipt($registration));
                } catch (\Exception $emailError) {
                    \Log::error('Failed to send donation receipt email: ' . $emailError->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'message' => ($donationType === 'money') 
                    ? 'Donation initiated. Please complete payment.' 
                    : 'Thank you for your donation!',
                'registration' => $registration,
                'payment_id' => $paymentId,
                'requires_payment' => ($donationType === 'money'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Donation registration failed: ' . $e->getMessage());
            return response()->json(['message' => 'Donation registration failed: ' . $e->getMessage()], 500);
        }
    }
}
