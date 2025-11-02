"use client";

import { useEvents } from "../hooks/useEvents";
import EventCard from "../components/EventCard";
import Pagination from "../components/Pagination";
import SortFilter from "../components/SortFilter";
import EventCardSkeleton from "../components/EventCardSkeleton";
import SearchFilters from "../components/SearchFilters";
import { useState, useEffect } from "react";
import MapView from "../components/MapView";

export default function CategoryPage() {
  const {
    displayedEvents,
    loading,
    pageLoading,
    selectedCategory,
    setSelectedCategory,
    showNearestOnly,
    setShowNearestOnly,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    goToPage,
    totalCount,
    events: filteredEvents,
    sortBy,
    setSortBy,
    navigateToCategoryPage,
    applySearch,
  } = useEvents(12, true); // true = category page

  const [mapView, setMapView] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


  const getCategoryTitle = () => {
    const titles = {
      all: "All Events",
      volunteer: "Volunteer Events",
      food_rescue: "Food Rescue Events",
      charity_run: "Charity Runs",
      nearest: "Events Near You",
    };
    return titles[selectedCategory] || "Events";
  };

  useEffect(() => {
    if (!pageLoading) {
      document
        .getElementById("topSection")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [pageLoading]);

  const handlePageChange = async (newPage) => {
    await goToPage(newPage);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    navigateToCategoryPage(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" id="topSection">
      {/* Search Filters Component */}
      <SearchFilters
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        showNearestOnly={showNearestOnly}
        setShowNearestOnly={setShowNearestOnly}
        mapView={mapView}
        setMapView={setMapView}
        onSearch={applySearch} 
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mapView && <MapView events={filteredEvents} />}
        <div
          className={`flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 ${
            mapView ? "mt-5" : ""
          }`}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getCategoryTitle()}
            </h1>
            <p className="text-gray-600">
              Page {currentPage} of {totalPages} - Showing{" "}
              {filteredEvents.length} of {totalCount} events
              {searchQuery && ` for "${searchQuery}"`}
              {showNearestOnly && " near your location"}
            </p>
          </div>

          <SortFilter sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        {filteredEvents.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new
              events.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {pageLoading
                ? Array.from({ length: 12 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))
                : displayedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={pageLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
