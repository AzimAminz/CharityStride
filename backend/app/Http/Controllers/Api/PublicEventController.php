<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicEventController extends Controller
{
    /**
     * Get published events with search, filtering, sorting, and geofencing
     */
    public function index(Request $request)
    {
        $query = Event::query()
            ->with(['ngo:id,name,logo_url'])
            ->published()
            ->openForRegistration();

        // Search functionality
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Category filtering
        if ($request->filled('category')) {
            $categories = explode(',', $request->category);
            $query->where(function($q) use ($categories) {
                foreach ($categories as $category) {
                    switch (strtolower($category)) {
                        case 'volunteer':
                            $q->orWhere('has_volunteer', true);
                            break;
                        case 'donation':
                            $q->orWhere('has_donation', true);
                            break;
                        case 'participant':
                            $q->orWhere('has_participant', true);
                            break;
                    }
                }
            });
        }

        // Geofencing - filter by location radius
        if ($request->filled('lat') && $request->filled('lng')) {
            $radius = $request->input('radius', 10); // Default 10km
            $query->nearby($request->lat, $request->lng, $radius);
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'popular':
                $query->orderBy('registration_count', 'desc');
                break;
            case 'ending_soon':
                $query->orderBy('end_date', 'asc');
                break;
            case 'nearest':
                // Already sorted by distance if geofencing is active
                if (!$request->filled('lat') || !$request->filled('lng')) {
                    $query->orderBy('created_at', 'desc');
                }
                break;
            case 'newest':
            default:
                $query->orderBy('published_at', 'desc')
                      ->orderBy('created_at', 'desc');
                break;
        }

        // Pagination
        $perPage = $request->input('per_page', 12);
        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Get popular events (top 8 by registration count)
     */
    public function popular()
    {
        $events = Event::query()
            ->with(['ngo:id,name,logo_url'])
            ->published()
            ->openForRegistration()
            ->orderBy('registration_count', 'desc')
            ->limit(8)
            ->get();

        return response()->json($events);
    }

    /**
     * Get newest published events (top 4)
     */
    public function newest()
    {
        $events = Event::query()
            ->with(['ngo:id,name,logo_url'])
            ->published()
            ->openForRegistration()
            ->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        return response()->json($events);
    }

    /**
     * Get search suggestions for autocomplete
     */
    public function suggestions(Request $request)
    {
        if (!$request->filled('q')) {
            return response()->json([]);
        }

        $query = $request->q;

        // Get matching event titles
        $eventTitles = Event::query()
            ->published()
            ->openForRegistration()
            ->where('title', 'LIKE', "%{$query}%")
            ->limit(5)
            ->pluck('title')
            ->map(fn($title) => ['type' => 'event', 'text' => $title]);

        // Get matching NGO names
        $ngoNames = Event::query()
            ->published()
            ->openForRegistration()
            ->join('ngos', 'events.ngo_id', '=', 'ngos.id')
            ->where('ngos.name', 'LIKE', "%{$query}%")
            ->distinct()
            ->limit(3)
            ->pluck('ngos.name')
            ->map(fn($name) => ['type' => 'ngo', 'text' => $name]);

        // Get matching cities
        $cities = Event::query()
            ->published()
            ->openForRegistration()
            ->where('city', 'LIKE', "%{$query}%")
            ->whereNotNull('city')
            ->distinct()
            ->limit(2)
            ->pluck('city')
            ->map(fn($city) => ['type' => 'location', 'text' => $city]);

        $suggestions = $eventTitles
            ->concat($ngoNames)
            ->concat($cities)
            ->take(10);

        return response()->json($suggestions);
    }

    /**
     * Get single event details (public view)
     */
    public function show($id)
    {
        $event = Event::query()
            ->with([
                'ngo',
                'sections',
                'participantCategories.tiers',
                'volunteerRoles' => function($query) {
                    $query->with(['shifts', 'roleType', 'requiredSkill']);
                },
                'donationConfig',
                'moneyDonationOptions',
                'itemDonationOptions'
            ])
            ->published()
            ->find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found or not published'
            ], 404);
        }

        return response()->json($event);
    }
}
