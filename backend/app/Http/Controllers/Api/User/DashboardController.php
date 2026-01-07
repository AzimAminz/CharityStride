<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use App\Models\DonationRegistration;
use App\Models\Payment;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // 1. Events Joined (Total registrations)
        $participantCount = ParticipantRegistration::where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'approved', 'checked_in'])
            ->count();
        $volunteerCount = VolunteerRegistration::where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'approved', 'checked_in'])
            ->count();
        
        $totalEvents = $participantCount + $volunteerCount;

        // 2. Volunteer Hours
        // Note: Using SUM on total_hours which is captured during check-out or manual entry
        $totalHours = VolunteerRegistration::where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'approved', 'completed'])
            ->sum('total_hours') ?: 0;

        // 3. Total Donated (Money donations)
        // Look for successful payments related to donation registrations OR participant registrations fees
        $donationAmount = Payment::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->where('payable_type', DonationRegistration::class)
            ->sum('amount');
            
        // Optional: Include participant category fees in "Total Donated" if user considers them contributions?
        // Usually, dashboard "Total Donated" is specifically for donation module.
        
        $totalDonated = $donationAmount;

        // 4. Certificates
        $certificatesCount = VolunteerRegistration::where('user_id', $user->id)
            ->where('attendance_status', 'completed')
            ->whereNotNull('check_in_time')
            ->whereNotNull('check_out_time')
            ->count();

        // 5. Recent Activities
        $recentParticipants = ParticipantRegistration::with(['event', 'participantCategory'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => 'p-' . $reg->id,
                    'type' => 'registration',
                    'title' => 'Registered for ' . ($reg->event->title ?? 'Event'),
                    'description' => 'Successfully registered as participant' . ($reg->participantCategory ? ' - ' . $reg->participantCategory->category_name : ''),
                    'date' => $reg->created_at->diffForHumans(),
                    'created_at' => $reg->created_at,
                    'icon' => 'calendar',
                    'color' => 'text-blue-600',
                    'bg' => 'bg-blue-100',
                ];
            });

        $recentVolunteers = VolunteerRegistration::with(['event', 'volunteerRole'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($reg) {
                return [
                    'id' => 'v-' . $reg->id,
                    'type' => 'volunteer',
                    'title' => 'Registered for ' . ($reg->event->title ?? 'Event'),
                    'description' => 'Volunteer role: ' . ($reg->volunteerRole->custom_role_name ?? $reg->volunteerRole->roleType->name_en ?? 'Volunteer'),
                    'date' => $reg->created_at->diffForHumans(),
                    'created_at' => $reg->created_at,
                    'icon' => 'users',
                    'color' => 'text-green-600',
                    'bg' => 'bg-green-100',
                ];
            });

        $recentDonations = DonationRegistration::with(['event', 'payments'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($reg) {
                $amount = $reg->amount_paid ?: $reg->payments->where('payment_status', 'paid')->sum('amount');
                return [
                    'id' => 'd-' . $reg->id,
                    'type' => 'donation',
                    'title' => 'Donated to ' . ($reg->event->title ?? 'Event'),
                    'description' => 'Thank you for your RM ' . number_format($amount / 100, 2) . ' donation',
                    'date' => $reg->created_at->diffForHumans(),
                    'created_at' => $reg->created_at,
                    'icon' => 'receipt',
                    'color' => 'text-purple-600',
                    'bg' => 'bg-purple-100',
                ];
            });

        $activities = $recentParticipants->concat($recentVolunteers)->concat($recentDonations)
            ->sortByDesc('created_at')
            ->take(50)
            ->values();

        return response()->json([
            'stats' => [
                'total_events' => $totalEvents,
                'total_hours' => number_format($totalHours, 1),
                'total_donated' => 'RM ' . number_format($totalDonated / 100, 2),
                'certificates_count' => $certificatesCount,
            ],
            'recent_activities' => $activities,
            'user' => $user
        ]);
    }
}
