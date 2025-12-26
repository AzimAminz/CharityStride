"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { getEvents } from "../../lib/api/publicEventsApi";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import LocationDropdown from "../components/LocationDropdown";
import EventCard from "../components/EventCard";
import Pagination from "../components/Pagination";

const SearchPage = () => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q");
  const category = searchParams.get("category");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");
  const sort = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, category, lat, lng, radius, sort, currentPage]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        per_page: 12,
        sort,
      };

      if (searchQuery) params.search = searchQuery;
      if (category) params.category = category;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = radius || 10;
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

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/events/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    router.push("/events");
  };

  const hasActiveFilters = searchQuery || category || (lat && lng);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar initialQuery={searchQuery || ""} />
            </div>

            <div className="flex items-center gap-3">
              <CategoryFilter />
              <LocationDropdown />
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">
                Active filters:
              </span>

              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  Search: "{searchQuery}"
                </span>
              )}

              {category &&
                category.split(",").map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize"
                  >
                    {cat}
                  </span>
                ))}

              {lat && lng && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Near Me ({radius || 10}km)
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-full text-sm flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Events"}
              </h1>
              {pagination && (
                <p className="text-gray-600">
                  Found {pagination.total} event
                  {pagination.total !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Events Grid */}
            {events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
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
                  {searchQuery
                    ? `No events match "${searchQuery}". Try different keywords or filters.`
                    : "Try adjusting your filters or search query"}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
