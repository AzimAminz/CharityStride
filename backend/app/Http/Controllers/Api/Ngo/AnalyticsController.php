<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use App\Models\DonationRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $eventIds = Event::where('ngo_id', $ngo->id)->pluck('id');

        // 1. Overall Stats
        $totalParticipants = ParticipantRegistration::whereIn('event_id', $eventIds)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->count();
        
        $totalVolunteers = VolunteerRegistration::whereIn('event_id', $eventIds)
            ->whereIn('status', ['approved', 'checked_in'])
            ->count();

        $totalDonationsCents = DonationRegistration::whereIn('event_id', $eventIds)
            ->sum('amount_paid');
        
        $totalVolunteerHours = VolunteerRegistration::whereIn('event_id', $eventIds)
            ->sum('total_hours') ?: 0;

        // 2. Registration Trend (Last 6 months)
        $registrationTrend = DB::table('participant_registrations')
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('count(*) as count'))
            ->whereIn('event_id', $eventIds)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        $volunteerTrend = DB::table('volunteer_registrations')
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('count(*) as count'))
            ->whereIn('event_id', $eventIds)
            ->whereIn('status', ['approved', 'checked_in'])
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // 3. Donation Growth (Last 6 months)
        $donationTrend = DB::table('donation_registrations')
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('sum(amount_paid) as amount'))
            ->whereIn('event_id', $eventIds)
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function($item) {
                return [
                    'month' => $item->month,
                    'amount' => $item->amount / 100
                ];
            });

        // 4. Event Comparison (Top 5 events by total impact)
        $eventPerformance = Event::where('ngo_id', $ngo->id)
            ->withCount(['participantRegistrations' => function($q) {
                $q->whereIn('status', ['confirmed', 'checked_in']);
            }])
            ->withCount(['volunteerRegistrations' => function($q) {
                $q->whereIn('status', ['approved', 'checked_in']);
            }])
            ->get()
            ->map(function($event) {
                $donations = DonationRegistration::where('event_id', $event->id)->sum('amount_paid') / 100;
                return [
                    'name' => strlen($event->title) > 20 ? substr($event->title, 0, 17) . '...' : $event->title,
                    'full_name' => $event->title,
                    'participants' => $event->participant_registrations_count,
                    'volunteers' => $event->volunteer_registrations_count,
                    'donations' => $donations,
                ];
            })
            ->sortByDesc(function($item) {
                return $item['participants'] + $item['volunteers'];
            })
            ->take(5)
            ->values();

        return response()->json([
            'stats' => [
                'total_participants' => $totalParticipants,
                'total_volunteers' => $totalVolunteers,
                'total_donations' => $totalDonationsCents / 100,
                'total_volunteer_hours' => round($totalVolunteerHours, 1),
            ],
            'trends' => [
                'registrations' => $registrationTrend,
                'volunteers' => $volunteerTrend,
                'donations' => $donationTrend,
            ],
            'event_performance' => $eventPerformance,
        ]);
    }

    public function generateReport(Request $request)
    {
        // This will be called by frontend to get clean data for PDF generation
        return $this->index($request);
    }
}
