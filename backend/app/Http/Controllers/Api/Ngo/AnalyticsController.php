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
    public function getEventAnalytics(Request $request)
    {
        $user = Auth::user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $year = $request->query('year', date('Y'));
        $month = $request->query('month');

        $query = Event::where('ngo_id', $ngo->id)
            ->where('is_published', true)
            ->whereYear('start_date', $year);

        if ($month) {
            $query->whereMonth('start_date', $month);
        }

        $events = $query->withCount([
            'participantRegistrations' => function ($q) {
                $q->whereIn('status', ['confirmed', 'checked_in']);
            },
            'volunteerRegistrations' => function ($q) {
                $q->whereIn('status', ['approved', 'checked_in']);
            },
            'donationRegistrations'
        ])->get();

        $analytics = $events->map(function ($event) {
            return [
                'name' => strlen($event->title) > 15 ? substr($event->title, 0, 15) . '...' : $event->title,
                'full_name' => $event->title,
                'date' => Carbon::parse($event->start_date)->format('d M Y'),
                'participants' => $event->participant_registrations_count,
                'volunteers' => $event->volunteer_registrations_count,
                'donors' => $event->donation_registrations_count,
            ];
        });

        return response()->json($analytics);
    }

    public function getEventPerformanceTable(Request $request) {
        $user = Auth::user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $search = $request->query('search');
        $year = $request->query('year'); // Optional
        $month = $request->query('month'); // Optional
        $perPage = $request->query('per_page', 10);

        $query = Event::where('ngo_id', $ngo->id)
            ->where('is_published', true);

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($year) {
            $query->whereYear('start_date', $year);
        }

        if ($month) {
            $query->whereMonth('start_date', $month);
        }

        $events = $query->with(['donationConfig'])
            ->withCount(['participantRegistrations' => function ($q) {
                $q->whereIn('status', ['confirmed', 'checked_in']);
            }])
            ->withCount(['volunteerRegistrations' => function ($q) {
                $q->whereIn('status', ['approved', 'checked_in']);
            }])
            ->orderBy('start_date', 'desc')
            ->paginate($perPage);

        // Process logic for each event
        $events->getCollection()->transform(function ($event) {
            // Calculate financials manually as before, but per item
            $dQuery = DonationRegistration::where('event_id', $event->id);
            $pQuery = ParticipantRegistration::where('event_id', $event->id)
                ->whereIn('status', ['confirmed', 'checked_in']);
            
            $donations = $dQuery->sum('amount_paid') / 100;
            $regFees = $pQuery->sum('amount_paid') / 100;
            $targetAmount = ($event->donationConfig?->target_amount ?? 0) / 100;

            return [
                'id' => $event->id,
                'full_name' => $event->title,
                'start_date' => Carbon::parse($event->start_date)->format('d M Y'), // Format date
                'participants' => $event->participant_registrations_count,
                'volunteers' => $event->volunteer_registrations_count,
                'donations' => $donations,
                'registration_fees' => $regFees,
                'total_raised' => $donations + $regFees,
                'has_donation_target' => $event->donationConfig?->has_target ?? false,
                'donation_target_amount' => $targetAmount,
                'achievement_percent' => ($event->donationConfig?->has_target && $targetAmount > 0)
                    ? min(100, round(($donations / $targetAmount) * 100, 1))
                    : null,
            ];
        });

        return response()->json($events);
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $eventIds = Event::where('ngo_id', $ngo->id)->where('is_published', true)->pluck('id');
        $range = $request->query('range', '6m'); // default to 6 months
        
        $startDate = match ($range) {
            '7d' => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '3m' => Carbon::now()->subMonths(3),
            '6m' => Carbon::now()->subMonths(6),
            '1y' => Carbon::now()->subYear(),
            'all' => Carbon::parse('2020-01-01'), // Long enough back
            default => Carbon::now()->subMonths(6),
        };

        // Determine grouping for trends based on range
        // If range <= 30 days, we group by date. Otherwise by month.
        $groupBy = (in_array($range, ['7d', '30d'])) ? 'date' : 'month';
        $format = ($groupBy === 'date') ? '%Y-%m-%d' : '%Y-%m';

        // 1. Overall Stats (Filtered by range if not 'all')
        $pQuery = ParticipantRegistration::whereIn('event_id', $eventIds)
            ->whereIn('status', ['confirmed', 'checked_in']);
        $vQuery = VolunteerRegistration::whereIn('event_id', $eventIds)
            ->whereIn('status', ['approved', 'checked_in']);
        $dQuery = DonationRegistration::whereIn('event_id', $eventIds);

        if ($range !== 'all') {
            $pQuery->where('created_at', '>=', $startDate);
            $vQuery->where('created_at', '>=', $startDate);
            $dQuery->where('created_at', '>=', $startDate);
        }

        $totalParticipants = $pQuery->count();
        $totalVolunteers = $vQuery->count();
        $totalDonationsCents = $dQuery->sum('amount_paid');
        $totalVolunteerHours = $vQuery->sum('total_hours') ?: 0;

        // 2. Registration Trend
        $registrationTrend = DB::table('participant_registrations')
            ->select(DB::raw("DATE_FORMAT(created_at, '{$format}') as label"), DB::raw('count(*) as count'))
            ->whereIn('event_id', $eventIds)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where('created_at', '>=', $startDate)
            ->groupBy('label')
            ->orderBy('label', 'asc')
            ->get();

        $volunteerTrend = DB::table('volunteer_registrations')
            ->select(DB::raw("DATE_FORMAT(created_at, '{$format}') as label"), DB::raw('count(*) as count'))
            ->whereIn('event_id', $eventIds)
            ->whereIn('status', ['approved', 'checked_in'])
            ->where('created_at', '>=', $startDate)
            ->groupBy('label')
            ->orderBy('label', 'asc')
            ->get();

        // 3. Donation Growth
        $donationTrend = DB::table('donation_registrations')
            ->select(DB::raw("DATE_FORMAT(created_at, '{$format}') as label"), DB::raw('sum(amount_paid) as amount'))
            ->whereIn('event_id', $eventIds)
            ->where('created_at', '>=', $startDate)
            ->groupBy('label')
            ->orderBy('label', 'asc')
            ->get()
            ->map(function($item) {
                return [
                    'label' => $item->label,
                    'amount' => $item->amount / 100
                ];
            });

        // 4. Event Comparison (All published events by total impact)
        $eventPerformance = Event::where('ngo_id', $ngo->id)->where('is_published', true)
            ->withCount(['participantRegistrations' => function($q) use ($startDate, $range) {
                $q->whereIn('status', ['confirmed', 'checked_in']);
                if ($range !== 'all') $q->where('created_at', '>=', $startDate);
            }])
            ->withCount(['volunteerRegistrations' => function($q) use ($startDate, $range) {
                $q->whereIn('status', ['approved', 'checked_in']);
                if ($range !== 'all') $q->where('created_at', '>=', $startDate);
            }])
            ->with(['donationConfig'])
            ->get()
            ->map(function($event) use ($startDate, $range) {
                $dQuery = DonationRegistration::where('event_id', $event->id);
                $pQuery = ParticipantRegistration::where('event_id', $event->id)
                    ->whereIn('status', ['confirmed', 'checked_in']);

                if ($range !== 'all') {
                    $dQuery->where('created_at', '>=', $startDate);
                    $pQuery->where('created_at', '>=', $startDate);
                }

                $donations = $dQuery->sum('amount_paid') / 100;
                $regFees = $pQuery->sum('amount_paid') / 100;
                $targetAmount = ($event->donationConfig?->target_amount ?? 0) / 100;

                return [
                    'id' => $event->id,
                    'is_published' => (bool)$event->is_published,
                    'name' => strlen($event->title) > 20 ? substr($event->title, 0, 17) . '...' : $event->title,
                    'full_name' => $event->title,
                    'participants' => $event->participant_registrations_count,
                    'volunteers' => $event->volunteer_registrations_count,
                    'donations' => $donations,
                    'registration_fees' => $regFees,
                    'total_raised' => $donations + $regFees,
                    'has_donation_target' => $event->donationConfig?->has_target ?? false,
                    'donation_target_amount' => $targetAmount,
                    'achievement_percent' => ($event->donationConfig?->has_target && $targetAmount > 0)
                        ? min(100, round(($donations / $targetAmount) * 100, 1))
                        : null,
                ];
            })
            ->sortByDesc(function($item) {
                return $item['participants'] + $item['volunteers'] + ($item['total_raised'] > 0 ? 100 : 0);
            })
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
