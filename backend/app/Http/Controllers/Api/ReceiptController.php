<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParticipantRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptController extends Controller
{
    public function downloadReceipt($registrationId)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $registration = ParticipantRegistration::with(['event.ngo', 'user', 'participantCategory', 'payments'])
            ->findOrFail($registrationId);

        // Security check: ensure registration belongs to user
        if ($registration->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only generate receipt for paid registrations
        if ($registration->amount_paid == 0) {
            return response()->json(['message' => 'No payment found for this registration'], 404);
        }

        try {
            $pdf = Pdf::loadView('emails.receipt', ['registration' => $registration]);
            
            return $pdf->download('receipt-' . $registration->bib_number . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Receipt generation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to generate receipt: ' . $e->getMessage()], 500);
        }
    }
}
