"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEvents } from "../../lib/api/publicEventsApi";
import EventCard from "../components/EventCard";
import Pagination from "../components/Pagination";
import FilterSidebar from "./components/FilterSidebar";
import SearchResultsHeader from "./components/SearchResultsHeader";

import { useWebSocket } from "../../contexts/WebSocketProvider";

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { subscribe, isConnected } = useWebSocket();

  // URL Params
  const queryParam = searchParams.get("q") || "";
  const catParam = searchParams.get("category");
  const stateParam = searchParams.get("location") || "all";
  const sortParam = searchParams.get("sort") || "newest";
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");
  const pageParam = parseInt(searchParams.get("page") || "1");

  // State
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter State (synced with URL initially)
  const [filters, setFilters] = useState({
    categories: {
      volunteer: catParam?.includes("volunteer") || false,
      donation: catParam?.includes("donation") || false,
      participant: catParam?.includes("participant") || false,
    },
    state: stateParam,
    sort: sortParam,
  });

  // Fetch Events
  useEffect(() => {
    fetchEvents();
  }, [
    queryParam,
    catParam,
    stateParam,
    sortParam,
    latParam,
    lngParam,
    radiusParam,
    pageParam,
    refreshTrigger,
  ]);

  // Real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe(
      "public-events",
      "event.status.updated",
      (data) => {
        console.log("Search: Event status updated, triggering refresh", data);
        setRefreshTrigger((prev) => prev + 1);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageParam,
        per_page: 12,
        sort: sortParam,
        search: queryParam,
        state: stateParam !== "all" ? stateParam : undefined,
      };

      if (catParam) params.category = catParam;
      if (latParam && lngParam) {
        params.lat = latParam;
        params.lng = lngParam;
        params.radius = radiusParam || 10;
      }

      const response = await getEvents(params);
      setEvents(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
      });
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply Filters (Push to URL)
  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Categories
    const activeCats = Object.entries(filters.categories)
      .filter(([_, active]) => active)
      .map(([key]) => key);

    if (activeCats.length > 0) {
      params.set("category", activeCats.join(","));
    } else {
      params.delete("category");
    }

    // State (Ensure we use 'location' param to match backend API expectation if that's what's used,
    // but the fetchEvents uses params.state. Let's align them.)
    // Based on previous code, backend likely uses 'location' for state filter or 'state'.
    // Let's check getEvents api... actually usually it's best to stick to one.
    // The previous SearchPage used 'location' param in URL but passed it as 'state' to API.

    if (filters.state && filters.state !== "all") {
      params.set("location", filters.state);
    } else {
      params.delete("location");
    }

    // Sort
    if (filters.sort) {
      params.set("sort", filters.sort);
    }

    params.set("page", "1"); // Reset page
    router.replace(`/events/search?${params.toString()}`); // Use replace to avoid loose history or push
  };

  // Handle Sort Change (intercept for 'nearest')
  const handleSortChange = async (newSort) => {
    // If 'nearest' is selected and we don't have coordinates safely, ask for them
    if (newSort === "nearest") {
      if ("geolocation" in navigator) {
        setLoading(true); // Show loading state while fetching location
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude, longitude } = position.coords;

          // Update filters and URL with location
          setFilters((prev) => ({ ...prev, sort: newSort }));
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", newSort);
          params.set("lat", latitude);
          params.set("lng", longitude);
          params.set("radius", "50"); // Default 50km for nearest sort if not specified

          router.replace(`/events/search?${params.toString()}`);
        } catch (error) {
          console.error("Location access denied or failed:", error);
          alert(
            "Location access is required to find nearest events. Showing newest events instead."
          );
          // Fallback to newest if location denied
          setFilters((prev) => ({ ...prev, sort: "newest" }));
        } finally {
          setLoading(false);
        }
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    } else {
      // Standard sort
      setFilters((prev) => ({ ...prev, sort: newSort }));
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", newSort);

      // Remove geolocation params if switching away from nearest?
      // User might want to keep "near me" context even if sorting by date.
      // But usually "nearest" implies distance sort.
      // Let's keep them if they exist, or maybe clear them if user explicitly changes sort?
      // For now, let's leave them.

      router.push(`/events/search?${params.toString()}`);
    }
  };

  const handleResetFilters = () => {
    // Reset local state
    setFilters({
      categories: { volunteer: false, donation: false, participant: false },
      state: "all",
      sort: "newest",
    });

    // Clear URL params but STAY on search page (as requested)
    router.push("/events/search");
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/events/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            isOpen={isMobileFiltersOpen}
            onClose={() => setIsMobileFiltersOpen(false)}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <SearchResultsHeader
              searchQuery={queryParam}
              totalResults={pagination?.total || 0}
              sort={filters.sort}
              setSort={handleSortChange}
              location={stateParam}
              onOpenFilters={() => setIsMobileFiltersOpen(true)}
            />

            {/* Loading / Error / Content */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl h-[380px] animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <button
                  onClick={fetchEvents}
                  className="text-blue-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <EventCard key={`${event.id}-${index}`} event={event} />
                  ))}
                </div>
                {pagination && (
                  <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search query.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
