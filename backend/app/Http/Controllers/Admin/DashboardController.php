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
        $totalUsers = User::count();
        $totalNgos = Ngo::count();
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
                    'value' => number_format(Event::where('is_published', true)->count()),
                    'change' => 'Active now',
                    'trend' => 'neutral',
                    'icon' => 'calendar',
                    'color' => 'amber'
                ]
            ],
            'pending' => [
                'ngos_count' => $pendingNgoCount,
                'unpublish_count' => $pendingUnpublishCount,
                'ngos' => $pendingNgos,
                'unpublish_requests' => $unpublishRequests
            ],
            'revenue_chart' => $recentDonations,
            'ngo_categories' => $ngoCategories,
            'top_donors' => $topDonors,
        ]);
    }
}
