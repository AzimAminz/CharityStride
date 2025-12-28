"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Search, MapPin, Filter as FilterIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import StateDropdown from "./StateDropdown";

// Dynamically import EventMap to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import("./EventMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function FilterModal({
  isOpen,
  onClose,
  initialFilters,
  onApplyFilters,
  events,
}) {
  const router = useRouter();
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
    radius: 10, // km
  });

  // Malaysian states
  const states = [
    { value: "all", label: "All Malaysia" },
    { value: "johor", label: "Johor" },
    { value: "kedah", label: "Kedah" },
    { value: "kelantan", label: "Kelantan" },
    { value: "melaka", label: "Melaka" },
    { value: "negeri-sembilan", label: "Negeri Sembilan" },
    { value: "pahang", label: "Pahang" },
    { value: "penang", label: "Penang" },
    { value: "perak", label: "Perak" },
    { value: "perlis", label: "Perlis" },
    { value: "sabah", label: "Sabah" },
    { value: "sarawak", label: "Sarawak" },
    { value: "selangor", label: "Selangor" },
    { value: "terengganu", label: "Terengganu" },
    { value: "kuala-lumpur", label: "Kuala Lumpur" },
    { value: "labuan", label: "Labuan" },
    { value: "putrajaya", label: "Putrajaya" },
  ];

  // Initialize filters from props only when modal opens (isOpen changes from false to true)
  useEffect(() => {
    if (isOpen && initialFilters) {
      setFilters(initialFilters);
    }
  }, [isOpen]); // Only depend on isOpen, not initialFilters

  const handleCategoryChange = (category) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      categories: {
        ...prevFilters.categories,
        [category]: !prevFilters.categories[category],
      },
    }));
  };

  const handleMapToggle = () => {
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        mapView: !prevFilters.mapView,
      };
      return newFilters;
    });
  };

  const handleLocationChange = (location) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      userLocation: location,
    }));
  };

  const handleApply = () => {
    // Build query parameters
    const params = new URLSearchParams();

    // Add search query
    if (filters.search) {
      params.append("q", filters.search);
    }

    // Add location/state
    params.append("location", filters.state);

    // Add geolocation if available
    if (filters.userLocation) {
      params.append("lat", filters.userLocation.lat.toString());
      params.append("lng", filters.userLocation.lng.toString());
      params.append("radius", filters.radius.toString());
      params.append("sort", "nearest");
    }

    // Add categories if any selected
    const selectedCategories = Object.entries(filters.categories)
      .filter(([_, isSelected]) => isSelected)
      .map(([category]) => category);

    if (selectedCategories.length > 0) {
      params.append("categories", selectedCategories.join(","));
    }

    // Navigate to search page
    router.push(`/events/search?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
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
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-gray-900 flex items-center gap-2"
                  >
                    <FilterIcon className="w-6 h-6" />
                    Advanced Filters
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Map Toggle */}
                <div className="mb-6 flex items-center justify-between p-4 bg-blue-50 rounded-lg relative z-[1001]">
                  <div>
                    <h4 className="font-semibold text-gray-900">Map View</h4>
                    <p className="text-sm text-gray-600">
                      {filters.mapView
                        ? "Showing events within 10km radius"
                        : "Enable to see events on map"}
                    </p>
                  </div>
                  <button
                    onClick={handleMapToggle}
                    type="button"
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors z-[1002] cursor-pointer ${
                      filters.mapView ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform pointer-events-none ${
                        filters.mapView ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Map View */}
                {filters.mapView ? (
                  <div className="mb-6 relative z-0">
                    <EventMap
                      events={events}
                      selectedCategories={filters.categories}
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                ) : (
                  <>
                    {/* Search Field */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Events
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={filters.search}
                          onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                          }
                          placeholder="Search by event name, NGO, or location..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* State Dropdown */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State / Region
                      </label>
                      <StateDropdown
                        value={filters.state}
                        onChange={(value) =>
                          setFilters({ ...filters, state: value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* Category Checkboxes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Event Categories
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.categories.volunteer}
                        onChange={() => handleCategoryChange("volunteer")}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        Volunteer
                      </span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.categories.donation}
                        onChange={() => handleCategoryChange("donation")}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        Donation
                      </span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.categories.participant}
                        onChange={() => handleCategoryChange("participant")}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        Participant
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-6 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
