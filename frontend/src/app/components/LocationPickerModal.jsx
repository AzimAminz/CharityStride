"use client";

import { MapPin, X } from "lucide-react";
import { useMap } from "../ngo/events/create/hooks/useMap";
import { useEffect } from "react";

/**
 * Location Picker Modal Component
 * Uses Google Maps for location selection
 */
export default function LocationPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
  title = "Select Location",
  searchBoxId = "map-search",
}) {
  const {
    mapRef,
    mapSearch,
    isSearching,
    isGettingLocation,
    locationError,
    coordinates,
    handleGetCurrentLocation,
    handleMapSearchChange,
    handleManualSearch,
  } = useMap(searchBoxId);

  useEffect(() => {
    // When coordinates change and we have a location, enable "Use This Location" button
    if (coordinates.latitude && coordinates.longitude) {
      // Location is ready
    }
  }, [coordinates]);

  const handleUseLocation = () => {
    if (coordinates.latitude && coordinates.longitude) {
      onLocationSelect({
        location: coordinates.location || "",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-600" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Search Box */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                id={searchBoxId}
                type="text"
                value={mapSearch}
                onChange={handleMapSearchChange}
                onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Search for a location..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={handleManualSearch}
                disabled={isSearching || !mapSearch.trim()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
            <button
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {isGettingLocation
                ? "Getting location..."
                : "📍 Use my current location"}
            </button>
            {locationError && (
              <p className="text-sm text-red-600">{locationError}</p>
            )}
          </div>

          {/* Map */}
          <div
            ref={mapRef}
            className="w-full h-[400px] rounded-lg border-2 border-gray-300"
          />

          {/* Coordinates Display */}
          {coordinates.latitude && coordinates.longitude && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-emerald-900">
                Selected Location:
              </h4>
              {coordinates.location && (
                <p className="text-sm text-emerald-800">
                  {coordinates.location}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUseLocation}
            disabled={!coordinates.latitude || !coordinates.longitude}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use This Location
          </button>
        </div>
      </div>
    </div>
  );
}
