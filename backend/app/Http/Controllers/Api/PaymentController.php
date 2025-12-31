<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\ParticipantRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationConfirmation;

class PaymentController extends Controller
{
    public function show($id)
    {
        $payment = Payment::with(['payable.event'])->where('id', $id)->firstOrFail();

        // Security check: ensure payment belongs to user
        if ($payment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($payment);
    }

    public function processMock(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($payment->payment_status === 'paid') {
            return response()->json(['message' => 'Payment already completed'], 200);
        }

        try {
            DB::beginTransaction();

            // 1. Update Payment
            $payment->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
                'payment_method' => $request->payment_method ?? 'fpx',
                'gateway_response' => ['status' => 'success', 'mock' => true],
            ]);

            // 2. Update Registration (Payable)
            $registration = $payment->payable;
            
            if ($registration) {
                // Handle ParticipantRegistration
                if ($registration instanceof \App\Models\ParticipantRegistration) {
                    $registration->update([
                        'status' => 'confirmed',
                        'amount_paid' => $payment->amount,
                    ]);
                    
                    // Increment counts
                    $registration->participantCategory->increment('current_registrations');
                    if ($registration->event) {
                        $event = $registration->event;
                        $participantConfig = $event->participantConfig;
                        if ($participantConfig) {
                            $participantConfig->increment('current_registrations');
                        }
                        
                        // Broadcast registration event
                        broadcast(new \App\Events\RegistrationCreated($event, 'participant'));
                    }
                }
                // Handle VolunteerRegistration
                elseif ($registration instanceof \App\Models\VolunteerRegistration) {
                    $registration->update([
                        'status' => 'confirmed',
                    ]);
                }
                // Handle Donation
                elseif ($registration instanceof \App\Models\DonationRegistration) {
                    $registration->update([
                        'status' => 'confirmed',
                    ]);
                }

                // Send confirmation email for all types
                try {
                    // Load necessary relationships based on type
                    if ($registration instanceof \App\Models\ParticipantRegistration) {
                        $registration->load(['event.ngo', 'user', 'participantCategory', 'payments']);
                    } elseif ($registration instanceof \App\Models\VolunteerRegistration) {
                        $registration->load(['event.ngo', 'user', 'volunteerRole', 'volunteerShift', 'payments']);
                    } elseif ($registration instanceof \App\Models\DonationRegistration) {
                        $registration->load(['event.ngo', 'user', 'payments']);
                    }
                    
                    Mail::to($registration->user->email)->send(new RegistrationConfirmation($registration));
                } catch (\Exception $emailError) {
                    \Log::error('Failed to send registration email: ' . $emailError->getMessage());
                    // Continue anyway - payment is successful
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment successful',
                'redirect_url' => '/user/registrations'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Payment processing failed: ' . $e->getMessage());
            return response()->json(['message' => 'Payment failed: ' . $e->getMessage()], 500);
        }
    }
}
