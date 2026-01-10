<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\ParticipantCategory;
use App\Models\ParticipantRegistration;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationConfirmation;
use Illuminate\Support\Facades\Validator;

class ParticipantRegistrationController extends Controller
{
    public function store(Request $request, $eventId)
    {
        $validator = Validator::make($request->all(), [
            'participant_category_id' => 'required|exists:participant_categories,id',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_phone' => 'required|string|max:20',
            'tshirt_size' => 'nullable|string|max:10',
            'preferred_session' => 'nullable|string|max:100',
            'special_requirements' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 1. Validate Event & Category
        $event = Event::findOrFail($eventId);
        if (!$event->is_published) {
            return response()->json(['message' => 'Event is not open for registration'], 403);
        }

        $category = ParticipantCategory::where('event_id', $eventId)
            ->findOrFail($request->participant_category_id);

        // 2. Check Capacity with pessimistic locking to prevent race conditions
        if ($category->capacity_type === 'limited') {
            // Lock the category row for update to prevent concurrent registrations
            $category = ParticipantCategory::where('id', $category->id)
                ->lockForUpdate()
                ->first();
                
            if ($category->current_registrations >= $category->capacity) {
                return response()->json(['message' => 'Category is fully booked'], 400);
            }
        }

        // 3. Check for existing registration for this user in this event (optional, but good practice)
        $existing = ParticipantRegistration::where('event_id', $eventId)
            ->where('user_id', Auth::id())
            ->whereIn('status', ['confirmed', 'pending_payment']) // Allow retry if 'cancelled' or 'failed'
            ->first();

        if ($existing) {
             // If pending payment, return that instead of erroring?
             if ($existing->status === 'pending_payment') {
                  $payment = $existing->payments()->where('payment_status', 'pending')->latest()->first();
                  if ($payment) {
                      return response()->json([
                        'message' => 'You have a pending registration waiting for payment.',
                        'payment_url' => '/payment/mock/' . $payment->id,
                        'registration_id' => $existing->id
                    ]);
                  }
             }
             return response()->json(['message' => 'You are already registered for this event.'], 400);
        }

        // 4. Calculate Fee
        $feeAmount = 0;
        $feeTierId = null;

        if ($category->has_fee) {
            if ($category->fee_type === 'fixed') {
                $feeAmount = $category->base_fee;
            } else {
                // Tiered fee logic: Find active tier
                $now = now();
                $tier = $category->feeTiers()
                    ->where('valid_from', '<=', $now)
                    ->where('valid_until', '>=', $now)
                    ->orderBy('fee_amount', 'asc') // Get cheapest valid tier? Or specifically logic?
                    ->first();
                
                // Fallback to base fee if no tier valid (or handle error)
                if ($tier) {
                    $feeAmount = $tier->fee_amount;
                    $feeTierId = $tier->id;
                } else {
                     $feeAmount = $category->base_fee; // Fallback
                }
            }
        }

        // 5. Create Registration & Payment (Transaction)
        try {
            DB::beginTransaction();

            // Lock the Event row to ensure sequential BIB generation and serialized access
            // This prevents race conditions where multiple users get the same BIB number
            $lockedEvent = Event::where('id', $eventId)->lockForUpdate()->first();

            // Pre-generate BIB number if required
            $bibNumber = null;
            if ($category->has_bib) {
                $lastBib = ParticipantRegistration::where('event_id', $eventId)
                    ->whereNotNull('bib_number')
                    ->orderByRaw('CAST(SUBSTRING(bib_number, 5) AS UNSIGNED) DESC')
                    ->value('bib_number');
                
                $nextNumber = $lastBib ? ((int) filter_var($lastBib, FILTER_SANITIZE_NUMBER_INT)) + 1 : 1;
                $bibNumber = 'BIB-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            }

            $status = ($feeAmount > 0) ? 'pending_payment' : 'confirmed';

            $registration = ParticipantRegistration::create([
                'event_id' => $eventId,
                'user_id' => Auth::id(),
                'participant_category_id' => $category->id,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'preferred_session' => $request->preferred_session,
                'special_requirements' => $request->special_requirements,
                'fee_tier_id' => $feeTierId,
                'amount_paid' => 0, // Set when paid
                'status' => $status,
                'tshirt_size' => $request->tshirt_size,
                'bib_number' => $bibNumber, // Explicitly passed
                // qr_code auto-generated by boot()
            ]);

            $paymentUrl = null;

            if ($feeAmount > 0) {
                $payment = $registration->payments()->create([
                    'user_id' => Auth::id(),
                    'amount' => $feeAmount,
                    'currency' => 'MYR',
                    'payment_method' => 'unspecified', // Will be selected on payment page
                    'payment_status' => 'pending',
                    'payment_reference' => 'PAY-' . strtoupper(uniqid()),
                    'payment_gateway' => 'mock_gateway', 
                ]);

                $paymentUrl = '/payment/mock/' . $payment->id;
            } else {
                // If free, increment counts immediately
                $category->increment('current_registrations');
                $event->participantConfig()->increment('current_registrations');
                
                // Broadcast registration event
                broadcast(new \App\Events\RegistrationCreated($event, 'participant'));
                
                // Send confirmation email (wrapped in try-catch)
                try {
                    Mail::to($registration->user->email)->send(new RegistrationConfirmation($registration));
                } catch (\Exception $emailError) {
                    \Log::error('Failed to send registration email: ' . $emailError->getMessage());
                    // Continue anyway - registration is successful
                }
            }

            DB::commit();

            return response()->json([
                'message' => ($feeAmount > 0) ? 'Registration initiated. Please make payment.' : 'Registration successful!',
                'registration' => $registration,
                'payment_url' => $paymentUrl,
                'is_paid_event' => ($feeAmount > 0)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Registration failed: ' . $e->getMessage());
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }
}
