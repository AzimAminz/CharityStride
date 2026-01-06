<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Ngo;
use App\Models\User;
use App\Models\DonationRegistration;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Generate Platform Overview Report
     */
    public function platformOverview(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $data = [
            'total_users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_ngos' => Ngo::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_events' => Event::whereBetween('created_at', [$startDate, $endDate])->count(),
            'published_events' => Event::where('is_published', true)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'total_revenue' => DonationRegistration::whereHas('payments', function($q) {
                $q->where('payment_status', 'paid');
            })->whereBetween('created_at', [$startDate, $endDate])->sum('amount_paid'),
            'total_participants' => ParticipantRegistration::where('status', 'confirmed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'total_volunteers' => VolunteerRegistration::where('status', 'approved')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'total_donations' => DonationRegistration::whereHas('payments', function($q) {
                $q->where('payment_status', 'paid');
            })->whereBetween('created_at', [$startDate, $endDate])->count(),
        ];

        return response()->json($data);
    }

    /**
     * Generate Revenue Report (CSV)
     */
    public function revenueReport(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $donations = DonationRegistration::with(['event', 'event.ngo', 'user'])
            ->whereHas('payments', function($q) {
                $q->where('payment_status', 'paid');
            })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $csvData = [];
        $csvData[] = ['Date', 'Event', 'NGO', 'Donor', 'Amount (RM)'];

        foreach ($donations as $donation) {
            $csvData[] = [
                $donation->created_at->format('Y-m-d H:i:s'),
                $donation->event->title ?? 'N/A',
                $donation->event->ngo->name ?? 'N/A',
                $donation->user->name ?? 'N/A',
                number_format($donation->amount_paid / 100, 2)
            ];
        }

        return $this->generateCSV($csvData, 'revenue_report_' . date('Ymd'));
    }

    /**
     * Generate NGO Performance Report (CSV)
     */
    public function ngoPerformanceReport(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $ngos = Ngo::with(['events' => function($q) use ($startDate, $endDate) {
            $q->where('is_published', true)
              ->whereNull('taken_down_at')
              ->whereBetween('created_at', [$startDate, $endDate]);
        }])->get();

        $csvData = [];
        $csvData[] = ['NGO Name', 'Registration No', 'Total Events', 'Total Funds Raised (RM)', 'Total Participants', 'Total Volunteers'];

        foreach ($ngos as $ngo) {
            $totalFunds = DonationRegistration::whereHas('event', function($q) use ($ngo) {
                $q->where('ngo_id', $ngo->id)
                  ->where('is_published', true)
                  ->whereNull('taken_down_at');
            })->whereHas('payments', function($q) {
                $q->where('payment_status', 'paid');
            })->whereBetween('created_at', [$startDate, $endDate])->sum('amount_paid');

            $totalParticipants = ParticipantRegistration::whereHas('event', function($q) use ($ngo) {
                $q->where('ngo_id', $ngo->id)
                  ->where('is_published', true)
                  ->whereNull('taken_down_at');
            })->where('status', 'confirmed')
            ->whereBetween('created_at', [$startDate, $endDate])->count();

            $totalVolunteers = VolunteerRegistration::whereHas('event', function($q) use ($ngo) {
                $q->where('ngo_id', $ngo->id)
                  ->where('is_published', true)
                  ->whereNull('taken_down_at');
            })->where('status', 'approved')
            ->whereBetween('created_at', [$startDate, $endDate])->count();

            $csvData[] = [
                $ngo->name,
                $ngo->registration_no,
                $ngo->events->count(),
                number_format($totalFunds / 100, 2),
                $totalParticipants,
                $totalVolunteers
            ];
        }

        return $this->generateCSV($csvData, 'ngo_performance_report_' . date('Ymd'));
    }

    /**
     * Generate Event Analytics Report (CSV)
     */
    public function eventAnalyticsReport(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $events = Event::with('ngo')
            ->where('is_published', true)
            ->whereNull('taken_down_at')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $csvData = [];
        $csvData[] = ['Event Title', 'NGO', 'Status', 'Start Date', 'End Date', 'Participants', 'Volunteers', 'Donations', 'Total Raised (RM)'];

        foreach ($events as $event) {
            $participants = ParticipantRegistration::where('event_id', $event->id)
                ->where('status', 'confirmed')->count();
            
            $volunteers = VolunteerRegistration::where('event_id', $event->id)
                ->where('status', 'approved')->count();
            
            $donations = DonationRegistration::where('event_id', $event->id)
                ->whereHas('payments', function($q) {
                    $q->where('payment_status', 'paid');
                })->count();
            
            $totalRaised = DonationRegistration::where('event_id', $event->id)
                ->whereHas('payments', function($q) {
                    $q->where('payment_status', 'paid');
                })->sum('amount_paid');

            $status = $event->is_published ? 'Published' : 'Draft';
            if ($event->taken_down_at) {
                $status = 'Taken Down';
            }

            $csvData[] = [
                $event->title,
                $event->ngo->name ?? 'N/A',
                $status,
                $event->start_date ? $event->start_date->format('Y-m-d') : 'N/A',
                $event->end_date ? $event->end_date->format('Y-m-d') : 'N/A',
                $participants,
                $volunteers,
                $donations,
                number_format($totalRaised / 100, 2)
            ];
        }

        return $this->generateCSV($csvData, 'event_analytics_report_' . date('Ymd'));
    }

    /**
     * Generate User Activity Report (CSV)
     */
    public function userActivityReport(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $users = User::whereBetween('created_at', [$startDate, $endDate])->get();

        $csvData = [];
        $csvData[] = ['User Name', 'Email', 'Role', 'Joined Date', 'Participant Registrations', 'Volunteer Registrations', 'Donations', 'Total Donated (RM)'];

        foreach ($users as $user) {
            $participantRegs = ParticipantRegistration::where('user_id', $user->id)
                ->where('status', 'confirmed')->count();
            
            $volunteerRegs = VolunteerRegistration::where('user_id', $user->id)
                ->where('status', 'approved')->count();
            
            $donations = DonationRegistration::where('user_id', $user->id)
                ->whereHas('payments', function($q) {
                    $q->where('payment_status', 'paid');
                })->count();
            
            $totalDonated = DonationRegistration::where('user_id', $user->id)
                ->whereHas('payments', function($q) {
                    $q->where('payment_status', 'paid');
                })->sum('amount_paid');

            $csvData[] = [
                $user->name,
                $user->email,
                ucfirst($user->role),
                $user->created_at->format('Y-m-d'),
                $participantRegs,
                $volunteerRegs,
                $donations,
                number_format($totalDonated / 100, 2)
            ];
        }

        return $this->generateCSV($csvData, 'user_activity_report_' . date('Ymd'));
    }

    /**
     * Get Revenue Graph Data
     */
    public function revenueGraphData(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $revenueData = DonationRegistration::whereHas('payments', function($q) {
                $q->where('payment_status', 'paid');
            })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(amount_paid) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($item) {
                return [
                    'date' => $item->date,
                    'revenue' => $item->total / 100
                ];
            });

        return response()->json($revenueData);
    }

    /**
     * Get NGO Performance Graph Data
     */
    public function ngoPerformanceGraphData(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $ngoData = Ngo::select('ngos.id', 'ngos.name')
            ->leftJoin('events', 'ngos.id', '=', 'events.ngo_id')
            ->leftJoin('donation_registrations', 'events.id', '=', 'donation_registrations.event_id')
            ->where('events.is_published', true)
            ->whereNull('events.taken_down_at')
            ->whereExists(function($query) {
                $query->select(DB::raw(1))
                    ->from('payments')
                    ->whereColumn('payments.donation_registration_id', 'donation_registrations.id')
                    ->where('payments.payment_status', 'paid');
            })
            ->whereBetween('donation_registrations.created_at', [$startDate, $endDate])
            ->groupBy('ngos.id', 'ngos.name')
            ->selectRaw('SUM(donation_registrations.amount_paid) as total_raised')
            ->orderByDesc('total_raised')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->name,
                    'total_raised' => $item->total_raised / 100
                ];
            });

        return response()->json($ngoData);
    }

    /**
     * Get Event Analytics Graph Data
     */
    public function eventAnalyticsGraphData(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->subMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        $events = Event::where('is_published', true)
            ->whereNull('taken_down_at')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->limit(10)
            ->get();

        $eventData = $events->map(function($event) {
            $participants = ParticipantRegistration::where('event_id', $event->id)
                ->where('status', 'confirmed')->count();
            
            $volunteers = VolunteerRegistration::where('event_id', $event->id)
                ->where('status', 'approved')->count();
            
            $donations = DonationRegistration::where('event_id', $event->id)
                ->whereHas('payments', function($q) {
                    $q->where('payment_status', 'paid');
                })->count();

            return [
                'name' => strlen($event->title) > 20 ? substr($event->title, 0, 20) . '...' : $event->title,
                'participants' => $participants,
                'volunteers' => $volunteers,
                'donations' => $donations
            ];
        });

        return response()->json($eventData);
    }

    /**
     * Helper function to generate CSV response
     */
    private function generateCSV($data, $filename)
    {
        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
        ]);
    }
}
