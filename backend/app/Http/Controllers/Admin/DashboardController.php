<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Ngo;
use App\Models\Event;
use App\Models\DonationRegistration;
use App\Models\EventUnpublishRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Overview Stats
        $totalUsers = User::where('role', 'user')->count();
        $totalNgos = Ngo::where('status', 'approved')->count();
        $totalEvents = Event::count();
        $totalDonationsCents = DonationRegistration::sum('amount_paid');
        
        $pendingNgoCount = Ngo::where('status', 'pending')->count();
        $pendingUnpublishCount = EventUnpublishRequest::where('status', 'pending')->count();

        // 2. Growth Data (Last 7 days)
        $sevenDaysAgo = Carbon::now()->subDays(7);
        $userGrowth = User::where('created_at', '>=', $sevenDaysAgo)->count();
        $ngoGrowth = Ngo::where('created_at', '>=', $sevenDaysAgo)->count();

        // 3. Financial Analytics (Last 30 days)
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $recentDonations = DonationRegistration::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount_paid) as total'))
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 4. Pending Tasks
        $pendingNgos = Ngo::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        $pendingEvents = Event::with('ngo')
            ->where('status', 'pending_approval')
            ->latest()
            ->take(5)
            ->get();

        $unpublishRequests = EventUnpublishRequest::with(['event', 'event.ngo'])
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get();

        // 5. Recent Platform Activity
        $recentUsers = User::latest()->take(5)->get();
        $recentEvents = Event::with('ngo')->latest()->take(5)->get();

        // 6. Category Breakdown
        $ngoCategories = Ngo::select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->get();

        // 7. Top Donors (Top 5)
        $topDonors = DonationRegistration::with('user:id,name,email')
            ->select('user_id', DB::raw('SUM(amount_paid) as total_contributed'))
            ->groupBy('user_id')
            ->orderBy('total_contributed', 'DESC')
            ->take(5)
            ->get();

        // 8. Event Analytics (Top 5 Active Events)
        $eventAnalytics = Event::withCount(['participantRegistrations', 'donationRegistrations', 'volunteerRegistrations'])
            ->whereNotIn('status', ['rejected', 'taken_down'])
            ->orderByRaw('(participant_registrations_count + donation_registrations_count + volunteer_registrations_count) DESC')
            ->take(5)
            ->get()
            ->map(function ($event) {
                return [
                    'name' => \Illuminate\Support\Str::limit($event->title, 20),
                    'full_name' => $event->title,
                    'participants' => $event->participant_registrations_count,
                    'donors' => $event->donation_registrations_count,
                    'volunteers' => $event->volunteer_registrations_count,
                    'date' => $event->start_date ? $event->start_date->format('d M Y') : 'TBA'
                ];
            });

        // 9. NGO Performance (Top 5 by Funds Raised)
        $ngoPerformance = Ngo::withCount('activeEvents')
            ->withSum(['donationRegistrations' => function($q) {
                $q->whereHas('payments', function($sq) {
                    $sq->where('payment_status', 'paid');
                });
            }], 'amount_paid')
            ->orderByDesc('donation_registrations_sum_amount_paid')
            ->take(5)
            ->get()
            ->map(function($ngo) {
                return [
                    'name' => $ngo->name,
                    'events_count' => $ngo->active_events_count,
                    'total_raised' => $ngo->donation_registrations_sum_amount_paid / 100 // Convert cents to RM
                ];
            });

        return response()->json([
            'stats' => [
                [
                    'label' => 'Total Users',
                    'value' => number_format($totalUsers),
                    'change' => "+{$userGrowth} this week",
                    'trend' => 'up',
                    'icon' => 'users',
                    'color' => 'blue'
                ],
                [
                    'label' => 'Total NGOs',
                    'value' => number_format($totalNgos),
                    'change' => "+{$ngoGrowth} this week",
                    'trend' => 'up',
                    'icon' => 'building',
                    'color' => 'emerald'
                ],
                [
                    'label' => 'Donations Raised',
                    'value' => 'RM ' . number_format($totalDonationsCents / 100, 2),
                    'change' => 'Platform wide',
                    'trend' => 'up',
                    'icon' => 'heart',
                    'color' => 'rose'
                ],
                [
                    'label' => 'Live Events',
                    'value' => number_format(Event::where('status', 'open')->count()),
                    'change' => 'Active now',
                    'trend' => 'neutral',
                    'icon' => 'calendar',
                    'color' => 'amber'
                ]
            ],
            'pending' => [
                'ngos_count' => $pendingNgoCount,
                'events_count' => Event::where('status', 'pending_approval')->count(),
                'unpublish_count' => $pendingUnpublishCount,
                'ngos' => $pendingNgos,
                'events' => $pendingEvents,
                'unpublish_requests' => $unpublishRequests
            ],
            'revenue_chart' => $recentDonations,
            'ngo_categories' => $ngoCategories,
            'top_donors' => $topDonors,
            'event_analytics' => $eventAnalytics,
            'ngo_performance' => $ngoPerformance,
        ]);
    }

    public function getAnalytics(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $month = $request->input('month'); // Optional, 1-12

        $query = Event::withCount(['participantRegistrations', 'donationRegistrations', 'volunteerRegistrations'])
            ->whereNotIn('status', ['rejected', 'taken_down']);

        if ($month && $month !== 'all') {
            $query->whereYear('start_date', $year)
                  ->whereMonth('start_date', $month);
        } else {
             $query->whereYear('start_date', $year);
        }

        $analytics = $query->orderByRaw('(participant_registrations_count + donation_registrations_count + volunteer_registrations_count) DESC')
            ->take(10) // Limit to top 10 for readability in graph
            ->get()
            ->map(function ($event) {
                return [
                    'name' => \Illuminate\Support\Str::limit($event->title, 15),
                    'full_name' => $event->title,
                    'participants' => $event->participant_registrations_count,
                    'donors' => $event->donation_registrations_count,
                    'volunteers' => $event->volunteer_registrations_count,
                    'date' => $event->start_date ? $event->start_date->format('d M Y') : 'TBA'
                ];
            });

        return response()->json($analytics);
    }

    public function getNgoPerformance(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $month = $request->input('month');

        $query = Event::query()
            ->whereNotIn('status', ['rejected', 'taken_down']);

        if ($month && $month !== 'all') {
            $query->whereYear('start_date', $year)
                  ->whereMonth('start_date', $month);
        } else {
             $query->whereYear('start_date', $year);
        }

        $events = $query->with('ngo')
            ->withCount(['participantRegistrations', 'volunteerRegistrations'])
            ->withSum(['donationRegistrations' => function($q) {
                $q->whereHas('payments', fn($p) => $p->where('payment_status', 'paid'));
            }], 'amount_paid')
            ->get();

        // Aggregate by NGO
        $ngoStats = $events->groupBy('ngo_id')->map(function ($ngoEvents) {
            $ngo = $ngoEvents->first()->ngo;
            return [
                'name' => \Illuminate\Support\Str::limit($ngo->name, 15),
                'full_name' => $ngo->name,
                'participants' => $ngoEvents->sum('participant_registrations_count'),
                'volunteers' => $ngoEvents->sum('volunteer_registrations_count'),
                'total_raised' => $ngoEvents->sum('donation_registrations_sum_amount_paid') / 100,
                'activity_score' => $ngoEvents->sum('participant_registrations_count') + $ngoEvents->sum('volunteer_registrations_count')
            ];
        })->sortByDesc('activity_score')->take(5)->values();

        return response()->json($ngoStats);
    }

    public function getEventDistribution(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $month = $request->input('month');
        
        $query = Event::whereYear('start_date', $year)
            ->whereNotIn('status', ['rejected', 'taken_down']);

        if ($month && $month !== 'all') {
            $query->whereMonth('start_date', $month);
        }

        $events = $query->withCount(['participantRegistrations', 'volunteerRegistrations'])
            ->get();

        $stateKeywords = [
            'Johor' => ['Johor'],
            'Kedah' => ['Kedah'],
            'Kelantan' => ['Kelantan'],
            'Melaka' => ['Melaka', 'Malacca'],
            'Negeri Sembilan' => ['Negeri Sembilan', 'N. Sembilan'],
            'Pahang' => ['Pahang'],
            'Perak' => ['Perak'],
            'Perlis' => ['Perlis'],
            'Pulau Pinang' => ['Pulau Pinang', 'Penang'],
            'Sabah' => ['Sabah'],
            'Sarawak' => ['Sarawak'],
            'Selangor' => ['Selangor'],
            'Terengganu' => ['Terengganu'],
            'Kuala Lumpur' => ['Kuala Lumpur', 'KL', 'W.P. Kuala Lumpur', 'Wilayah Persekutuan Kuala Lumpur'],
            'Putrajaya' => ['Putrajaya', 'W.P. Putrajaya'],
            'Labuan' => ['Labuan', 'W.P. Labuan']
        ];

        $distribution = collect($stateKeywords)->keys()->mapWithKeys(fn($state) => [$state => 0]);
        $distribution['Unknown'] = 0;

        foreach ($events as $event) {
            $address = $event->address ?? '';
            $matchedState = 'Unknown';

            foreach ($stateKeywords as $canonicalState => $keywords) {
                foreach ($keywords as $keyword) {
                    if (stripos($address, $keyword) !== false) {
                        $matchedState = $canonicalState;
                        break 2;
                    }
                }
            }

            // If not found in address, fallback to state column if valid
            if ($matchedState === 'Unknown' && $event->state) {
                // Check if event->state matches any canonical or keyword
                foreach ($stateKeywords as $canonicalState => $keywords) {
                     if (stripos($event->state, $canonicalState) !== false || in_array($event->state, $keywords)) {
                         $matchedState = $canonicalState;
                         break;
                     }
                }
            }

            $contribution = $event->participant_registrations_count + $event->volunteer_registrations_count;
            $distribution[$matchedState] += $contribution;
        }

        // Format for Recharts and sort
        $formatted = $distribution
            ->filter(fn($value) => $value > 0) // Only show states with activity
            ->map(fn($value, $key) => ['name' => $key, 'value' => $value])
            ->values()
            ->sortByDesc('value')
            ->values();

        return response()->json($formatted);
    }
}
