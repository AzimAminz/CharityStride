"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getEvents,
  getPopularEvents,
  getNewestEvents,
  getDonationEvents,
} from "../lib/api/publicEventsApi";
import { useWebSocket } from "../contexts/WebSocketProvider";
import SearchBar from "./components/SearchBar";
import FilterModal from "./components/FilterModal";
import EventCard from "./components/EventCard";
import PopularEventsCarousel from "./components/PopularEventsCarousel";
import ThumbnailCarousel from "./components/ThumbnailCarousel";

const EventsPage = () => {
  const [popularEvents, setPopularEvents] = useState([]);
  const [newestEvents, setNewestEvents] = useState([]);
  const [donationEvents, setDonationEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
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

  // Fetch sections data (Popular, Newest, Donations)
  const fetchSections = async () => {
    try {
      const [popular, newest, donation] = await Promise.all([
        getPopularEvents(),
        getNewestEvents(),
        getDonationEvents(),
      ]);
      setPopularEvents(popular);
      setNewestEvents(newest);
      setDonationEvents(donation);
    } catch (err) {
      console.error("Error fetching section events:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Fetch all events with filters and pagination
  useEffect(() => {
    fetchAllEvents();
  }, [currentPage, category, lat, lng, radius, sort, filters]);

  // Subscribe to real-time event updates
  useEffect(() => {
    if (!isConnected) return;

    // Listen for any status update (Publish, Unpublish, Take Down)
    const unsubscribe = subscribe(
      "public-events",
      "event.status.updated",
      (data) => {
        console.log("Public: Event status updated", data);
        // Refresh all data
        fetchSections();
        fetchAllEvents();
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, currentPage, category, lat, lng, radius, sort, filters]);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 9, // Updated to 9 for 3-column grid
      };

      if (filters.search) params.search = filters.search;
      if (filters.state !== "all") params.state = filters.state;

      const selectedCategories = [];
      if (filters.categories.volunteer) selectedCategories.push("volunteer");
      if (filters.categories.donation) selectedCategories.push("donation");
      if (filters.categories.participant)
        selectedCategories.push("participant");
      if (selectedCategories.length > 0)
        params.category = selectedCategories.join(",");

      if (filters.mapView && filters.userLocation) {
        params.lat = filters.userLocation.lat;
        params.lng = filters.userLocation.lng;
        params.radius = filters.radius;
      }

      if (category) params.category = category;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = radius || 10;
      }
      if (sort) params.sort = sort;

      const response = await getEvents(params);

      if (currentPage === 1) {
        setAllEvents(response.data);
      } else {
        // Append unique events only
        setAllEvents((prev) => {
          const newEvents = response.data.filter(
            (newEvent) => !prev.some((oldEvent) => oldEvent.id === newEvent.id)
          );
          return [...prev, ...newEvents];
        });
      }

      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      });
    } catch (err) {
      console.error("Error fetching all events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/events?${params.toString()}`, { scroll: false });
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.push(`/events?${params.toString()}`, { scroll: false });
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  if (initialLoading && !allEvents.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative text-white py-24 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hero-bg.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/70"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Don't miss out!
            </h1>
            <p className="text-xl md:text-2xl font-light">
              Explore the{" "}
              <span className="text-yellow-400 font-semibold">
                vibrant events
              </span>{" "}
              happening across Malaysia.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <SearchBar onFilterClick={handleFilterClick} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Popular Events Section (Main Carousel) */}
        {popularEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Trending Now
                </h2>
              </div>
            </div>

            <PopularEventsCarousel events={popularEvents} />
          </section>
        )}

        {/* New Events Section (Thumbnail Carousel) */}
        {newestEvents.length > 0 && (
          <ThumbnailCarousel
            title="Featured Events"
            events={newestEvents}
            link="/events/search?sort=newest"
          />
        )}

        {/* Donation Section (Thumbnail Carousel) */}
        {donationEvents.length > 0 && (
          <ThumbnailCarousel
            title="Donation Campaigns"
            events={donationEvents}
            link="/events/search?category=donation"
          />
        )}

        {/* All Events Section */}
        <section id="all-events" className="scroll-mt-20">
          <div className="flex flex-col items-start mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Events around Malaysia
            </h2>
            <div className="h-1.5 w-24 bg-emerald-500 mt-2 rounded-full"></div>
          </div>

          {allEvents.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                {allEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    distance={event.distance}
                    showDistance={!!lat && !!lng}
                  />
                ))}
              </div>

              {pagination && pagination.current_page < pagination.last_page ? (
                <div className="mt-20 w-full max-w-sm">
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={loading}
                    className="w-full py-4 px-8 bg-white border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-sm"
                  >
                    {loading ? "Loading..." : "See More"}
                  </button>
                </div>
              ) : (
                <p className="mt-16 text-gray-400 font-bold tracking-tight uppercase text-xs">
                  You've viewed all events around Malaysia!
                </p>
              )}
            </div>
          ) : !loading ? (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                We couldn't find any events matching your current filters.
              </p>
              <button
                onClick={() => router.push("/events")}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-100"
              >
                Reset Filters
              </button>
            </div>
          ) : null}
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
