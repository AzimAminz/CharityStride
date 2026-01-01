<?php

namespace App\Http\Controllers\Api\Ngo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Event;
use App\Models\ParticipantRegistration;
use App\Models\VolunteerRegistration;
use App\Models\DonationRegistration;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $ngo = $user->ngo;

        if (!$ngo) {
            return response()->json(['message' => 'NGO not found'], 404);
        }

        $eventIds = Event::where('ngo_id', $ngo->id)->pluck('id');

        // 1. Stats (Only on first load or can be kept global)
        $activeEventsCount = Event::where('ngo_id', $ngo->id)
            ->where('is_published', true)
            ->where(function($query) {
                $query->where('event_date', '>=', Carbon::today())
                      ->orWhereNull('event_date');
            })
            ->count();

        $totalParticipantRegs = ParticipantRegistration::whereIn('event_id', $eventIds)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->count();
        
        $totalVolunteerRegs = VolunteerRegistration::whereIn('event_id', $eventIds)
            ->whereIn('status', ['approved', 'checked_in'])
            ->count();

        $totalRegistrationsCount = $totalParticipantRegs + $totalVolunteerRegs;

        $totalDonationsCents = DonationRegistration::whereIn('event_id', $eventIds)
            ->sum('amount_paid');
        
        $totalVolunteerHours = VolunteerRegistration::whereIn('event_id', $eventIds)
            ->sum('total_hours') ?: 0;

        // 2. Activities (With searching, filter by type, sorting, and pagination)
        $search = $request->query('search');
        $type = $request->query('type'); // all, registration, volunteer, donation, event
        $sort = $request->query('sort', 'latest');
        $page = $request->query('page', 1);
        $perPage = 10;

        $pRegs = collect();
        $vRegs = collect();
        $dRegs = collect();
        $eActivities = collect();

        // 2a. Participant Registrations
        if (!$type || $type === 'registration') {
            $participantsQuery = ParticipantRegistration::with(['event', 'user'])
                ->whereIn('event_id', $eventIds);
            if ($search) {
                $participantsQuery->where(function ($q) use ($search) {
                    $q->whereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('event', fn($eq) => $eq->where('title', 'like', "%{$search}%"));
                });
            }
            $pRegs = $participantsQuery->get()->map(function ($reg) {
                return [
                    'id' => 'p-' . $reg->id,
                    'type' => 'registration',
                    'title' => 'New Participant Registration',
                    'description' => ($reg->user->name ?? 'A user') . " registered for '" . ($reg->event->title ?? 'Event') . "'",
                    'time' => $reg->created_at->diffForHumans(),
                    'created_at' => $reg->created_at,
                    'icon' => 'users',
                    'color' => 'text-blue-600',
                    'bg' => 'bg-blue-100',
                ];
            });
        }

        // 2b. Volunteer Registrations
        if (!$type || $type === 'volunteer') {
            $volunteersQuery = VolunteerRegistration::with(['event', 'user', 'volunteerRole'])
                ->whereIn('event_id', $eventIds);
            if ($search) {
                $volunteersQuery->where(function ($q) use ($search) {
                    $q->whereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('event', fn($eq) => $eq->where('title', 'like', "%{$search}%"))
                        ->orWhereHas('volunteerRole', fn($rq) => $rq->where('custom_role_name', 'like', "%{$search}%"));
                });
            }
            $vRegs = $volunteersQuery->get()->map(function ($reg) {
                $roleName = $reg->volunteerRole->custom_role_name ?? $reg->volunteerRole->roleType->name_en ?? 'Volunteer';
                return [
                    'id' => 'v-' . $reg->id,
                    'type' => 'volunteer',
                    'title' => 'New Volunteer Registration',
                    'description' => ($reg->user->name ?? 'A user') . " signed up as {$roleName} for '" . ($reg->event->title ?? 'Event') . "'",
                    'time' => $reg->created_at->diffForHumans(),
                    'created_at' => $reg->created_at,
                    'icon' => 'user-check',
                    'color' => 'text-green-600',
                    'bg' => 'bg-green-100',
                ];
            });
        }

        // 2c. Donation Registrations
        if (!$type || $type === 'donation') {
            $donationsQuery = DonationRegistration::with(['event', 'user'])
                ->whereIn('event_id', $eventIds);
            if ($search) {
                $donationsQuery->where(function ($q) use ($search) {
                    $q->whereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('event', fn($eq) => $eq->where('title', 'like', "%{$search}%"));
                });
            }
            $dRegs = $donationsQuery->get()->map(function ($reg) {
                $amount = $reg->amount_paid / 100;
                return [
                    'id' => 'd-' . $reg->id,
                    'type' => 'donation',
                    'title' => 'Donation Received',
                    'description' => ($reg->user->name ?? 'A user') . " donated RM " . number_format($amount, 2) . " for '" . ($reg->event->title ?? 'Event') . "'",
                    'time' => $reg->created_at->diffForHumans(),
                    'created_at' => $reg->created_at,
                    'icon' => 'heart',
                    'color' => 'text-purple-600',
                    'bg' => 'bg-purple-100',
                ];
            });
        }

        // 2d. Events
        if (!$type || $type === 'event') {
            $eventsQuery = Event::where('ngo_id', $ngo->id)->where('is_published', true);
            if ($search) {
                $eventsQuery->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }
            $eActivities = $eventsQuery->latest('published_at')->get()->map(function ($event) {
                return [
                    'id' => 'e-' . $event->id,
                    'type' => 'event',
                    'title' => 'Event Published',
                    'description' => "'" . $event->title . "' is now live",
                    'time' => $event->published_at ? $event->published_at->diffForHumans() : $event->created_at->diffForHumans(),
                    'created_at' => $event->published_at ?: $event->created_at,
                    'icon' => 'calendar',
                    'color' => 'text-emerald-600',
                    'bg' => 'bg-emerald-100',
                ];
            });
        }

        // Merge and Sort
        $allActivities = collect($pRegs)->concat($vRegs)->concat($dRegs)->concat($eActivities);
        if ($search) {
            $allActivities = $allActivities->filter(function($act) use ($search) {
                return stripos($act['title'], $search) !== false || 
                       stripos($act['description'], $search) !== false;
            });
        }
        
        if ($sort === 'oldest') {
            $allActivities = $allActivities->sortBy('created_at');
        } else {
            $allActivities = $allActivities->sortByDesc('created_at');
        }

        $totalActivities = $allActivities->count();
        $paginatedActivities = $allActivities->slice(($page - 1) * $perPage, $perPage)->values();

        // 3. Upcoming Events
        $upcomingEvents = Event::with(['participantCategories', 'volunteerRoles.shifts', 'donationConfig'])
            ->where('ngo_id', $ngo->id)
            ->where('is_published', true)
            ->where(function($query) {
                $query->where('event_date', '>=', Carbon::today())
                      ->orWhereNull('event_date');
            })
            ->orderBy('event_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($event) {
                $stats = $event->stats;
                
                // Calculate capacities
                $participantCapacity = $event->participantCategories->sum('capacity');
                $volunteerCapacity = $event->volunteerRoles->flatMap->shifts->sum('capacity');
                $donationTarget = ($event->donationConfig && $event->donationConfig->has_target) ? $event->donationConfig->target_amount : null;

                return [
                    'id' => $event->id,
                    'name' => $event->title,
                    'date' => $event->event_date ? $event->event_date->toDateString() : 'TBD',
                    'participants' => $stats['participants'] ?? 0,
                    'participant_capacity' => $participantCapacity,
                    'volunteers' => $stats['volunteers'] ?? 0,
                    'volunteer_capacity' => $volunteerCapacity,
                    'donations_raised' => ($stats['total_raised'] ?? 0) / 100,
                    'donation_target' => $donationTarget ? $donationTarget / 100 : null,
                    'has_participant' => $event->has_participant,
                    'has_volunteer' => $event->has_volunteer,
                    'has_donation' => $event->has_donation,
                    'status' => 'Published',
                ];
            });

        return response()->json([
            'stats' => [
                [
                    'label' => 'Active Events',
                    'value' => (string)$activeEventsCount,
                    'change' => 'Current active',
                    'color' => 'bg-blue-50 text-blue-600',
                    'iconBg' => 'bg-blue-100',
                    'icon' => 'calendar'
                ],
                [
                    'label' => 'Total Registrations',
                    'value' => (string)$totalRegistrationsCount,
                    'change' => 'Confirmed only',
                    'color' => 'bg-green-50 text-green-600',
                    'iconBg' => 'bg-green-100',
                    'icon' => 'users'
                ],
                [
                    'label' => 'Donations Raised',
                    'value' => 'RM ' . number_format($totalDonationsCents / 100, 0),
                    'change' => 'Across all events',
                    'color' => 'bg-purple-50 text-purple-600',
                    'iconBg' => 'bg-purple-100',
                    'icon' => 'dollar-sign'
                ],
                [
                    'label' => 'Volunteer Hours',
                    'value' => (string)round($totalVolunteerHours, 1),
                    'change' => 'Completed hours',
                    'color' => 'bg-orange-50 text-orange-600',
                    'iconBg' => 'bg-orange-100',
                    'icon' => 'user-check'
                ],
            ],
            'recentActivities' => $paginatedActivities,
            'upcomingEvents' => $upcomingEvents,
            'pagination' => [
                'total' => $totalActivities,
                'per_page' => $perPage,
                'current_page' => (int)$page,
                'last_page' => ceil($totalActivities / $perPage),
            ]
        ]);
    }
}
