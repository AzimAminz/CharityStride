"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getEvents,
  getPopularEvents,
  getNewestEvents,
} from "../lib/api/publicEventsApi";
import { useWebSocket } from "../contexts/WebSocketProvider";
import SearchBar from "./components/SearchBar";
import FilterModal from "./components/FilterModal";

import EventCard from "./components/EventCard";
import Pagination from "./components/Pagination";

const EventsPage = () => {
  const [popularEvents, setPopularEvents] = useState([]);
  const [newestEvents, setNewestEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    state: "all",
    categories: {
      volunteer: false,
      donation: false,
      participant: false,
    },
    mapView: false,
    userLocation: null,
    radius: 10,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscribe, isConnected } = useWebSocket();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");
  const sort = searchParams.get("sort");

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, [currentPage, category, lat, lng, radius, sort]);

  // Subscribe to real-time event updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe(
      "public-events",
      "event.published",
      (data) => {
        // Add new event to the top of newest events
        setNewestEvents((prev) => [data.event, ...prev.slice(0, 3)]);

        // Refresh all events if on first page
        if (currentPage === 1) {
          fetchAllEvents();
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, currentPage]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch in parallel
      const [popularRes, newestRes, allRes] = await Promise.all([
        getPopularEvents(),
        getNewestEvents(),
        fetchAllEvents(),
      ]);

      setPopularEvents(popularRes);
      setNewestEvents(newestRes);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async () => {
    try {
      const params = {
        page: currentPage,
        per_page: 12,
      };

      // Apply filters
      if (filters.search) params.search = filters.search;
      if (filters.state !== "all") params.state = filters.state;

      // Category filters
      const selectedCategories = [];
      if (filters.categories.volunteer) selectedCategories.push("volunteer");
      if (filters.categories.donation) selectedCategories.push("donation");
      if (filters.categories.participant)
        selectedCategories.push("participant");
      if (selectedCategories.length > 0) {
        params.category = selectedCategories.join(",");
      }

      // Geofencing (if map view and user location available)
      if (filters.mapView && filters.userLocation) {
        params.lat = filters.userLocation.lat;
        params.lng = filters.userLocation.lng;
        params.radius = filters.radius;
      }

      // Legacy URL params (for backward compatibility)
      if (category) params.category = category;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = radius || 10;
      }
      if (sort) params.sort = sort;

      const response = await getEvents(params);
      setAllEvents(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      });

      return response;
    } catch (err) {
      throw err;
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/events?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Trigger data refresh
    fetchAllData();
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  if (loading && !allEvents.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Hero Section - Malaysia Focused */}
      <div
        className="relative text-white py-24 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hero-bg.jpg)" }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/70"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-8">
            {/* Malaysia-focused heading */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Don't miss out!
            </h1>

            {/* Highlighted vibrant events */}
            <p className="text-xl md:text-2xl font-light">
              Explore the{" "}
              <span className="text-yellow-400 font-semibold">
                vibrant events
              </span>{" "}
              happening across Malaysia.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto">
            <SearchBar onFilterClick={handleFilterClick} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Popular Events Section */}
        {popularEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Popular Events
                </h2>
              </div>
              <Link
                href="/events/search?sort=popular"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                See All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-6 min-w-max md:grid md:grid-cols-4 md:min-w-0">
                {popularEvents.map((event) => (
                  <div key={event.id} className="w-72 md:w-auto">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* New Events Section */}
        {newestEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  New Events
                </h2>
              </div>
              <Link
                href="/events/search?sort=newest"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                See All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newestEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* All Events Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                All Events
              </h2>
            </div>
            {pagination && (
              <p className="text-gray-600">
                {pagination.total} event{pagination.total !== 1 ? "s" : ""}{" "}
                found
              </p>
            )}
          </div>

          {allEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    distance={event.distance}
                    showDistance={!!lat && !!lng}
                  />
                ))}
              </div>

              {pagination && (
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={() => router.push("/events")}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
        events={allEvents}
      />
    </div>
  );
};

export default EventsPage;
