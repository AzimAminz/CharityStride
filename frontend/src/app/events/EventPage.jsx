"use client";

import { useEvents } from "./hooks/useEvents";
import SearchFilters from "./components/SearchFilters";
import EventSection from "./components/EventSection";
import MapView from "./components/MapView";
import { useState, useMemo } from "react";

export default function EventsPage() {
  const {
    events,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showNearestOnly,
    setShowNearestOnly,
    userLocation,
    navigateToCategoryPage,
    handleMainPageSearch,
    applySearch,
  } = useEvents(12, false); // false = bukan category page

  const [mapView, setMapView] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


  // Filter events by category for sections
  const volunteerEvents = useMemo(
    () => events.filter((event) => event.type === "volunteer"),
    [events]
  );

  const foodRescueEvents = useMemo(
    () => events.filter((event) => event.type === "food_rescue"),
    [events]
  );

  const charityRunEvents = useMemo(
    () => events.filter((event) => event.type === "charity_run"),
    [events]
  );

  const nearestEvents = useMemo(
    () => (userLocation ? events.filter((event) => event.distance <= 10) : []),
    [events, userLocation]
  );

  const handleViewAll = (category) => {
    navigateToCategoryPage(category);
  };

  const handleSearch = () => {
    applySearch(); 
    navigateToCategoryPage(selectedCategory, 'default', searchQuery);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showNearestOnly={showNearestOnly}
        setShowNearestOnly={setShowNearestOnly}
        mapView={mapView}
        setMapView={setMapView}
        onSearch={handleSearch}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mapView ? (
          <MapView events={events} />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Meaningful Events
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join hands with our community to make a difference. From beach
                cleanups to charity runs, find events that match your passion
                and schedule.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {events.length}+
                </div>
                <div className="text-gray-600">Active Events</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {volunteerEvents.length}
                </div>
                <div className="text-gray-600">Volunteer Opportunities</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {foodRescueEvents.length}
                </div>
                <div className="text-gray-600">Food Rescue Missions</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  {charityRunEvents.length}
                </div>
                <div className="text-gray-600">Charity Runs</div>
              </div>
            </div>

            {/* Events Sections */}
            {userLocation && nearestEvents.length > 0 && (
              <EventSection
                title="📍 Nearest to You"
                events={nearestEvents}
                category="nearest"
                onViewAll={handleViewAll}
              />
            )}

            {volunteerEvents.length > 0 && (
              <EventSection
                title="🤝 Volunteer Events"
                events={volunteerEvents}
                category="volunteer"
                onViewAll={handleViewAll}
              />
            )}

            {foodRescueEvents.length > 0 && (
              <EventSection
                title="🍴 Food Rescue Events"
                events={foodRescueEvents}
                category="food_rescue"
                onViewAll={handleViewAll}
              />
            )}

            {charityRunEvents.length > 0 && (
              <EventSection
                title="🏃 Charity Runs"
                events={charityRunEvents}
                category="charity_run"
                onViewAll={handleViewAll}
              />
            )}

            {events.length === 0 && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
