"use client";

import React, { useState } from "react";
import { MapPin, Navigation, X, Loader } from "lucide-react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useRouter, useSearchParams } from "next/navigation";

const LocationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { location, loading, error, requestLocation, clearLocation } =
    useGeolocation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasActiveLocation = searchParams.get("lat") && searchParams.get("lng");

  const handleNearMe = () => {
    if (location) {
      applyLocation(location.lat, location.lng);
    } else {
      requestLocation();
    }
    setIsOpen(false);
  };

  const applyLocation = (lat, lng, radius = 10) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lat", lat.toString());
    params.set("lng", lng.toString());
    params.set("radius", radius.toString());
    params.set("sort", "nearest");

    router.push(`/events/search?${params.toString()}`);
  };

  const clearLocationFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    params.delete("radius");
    if (params.get("sort") === "nearest") {
      params.delete("sort");
    }

    const newUrl = params.toString()
      ? `/events/search?${params.toString()}`
      : "/events";
    router.push(newUrl);
    clearLocation();
  };

  // Auto-apply location when it's obtained
  React.useEffect(() => {
    if (location && !hasActiveLocation) {
      applyLocation(location.lat, location.lng);
    }
  }, [location]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
                    flex items-center gap-2 px-4 py-2 rounded-full border-2 
                    font-medium text-sm transition-all duration-200
                    ${
                      hasActiveLocation
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }
                `}
      >
        <MapPin className="w-4 h-4" />
        <span>{hasActiveLocation ? "Near Me (10km)" : "Location"}</span>
        {hasActiveLocation && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clearLocationFilter();
            }}
            className="ml-1 hover:bg-blue-600 rounded-full p-0.5 cursor-pointer inline-flex"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-64">
          <button
            onClick={handleNearMe}
            disabled={loading}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 text-blue-500" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {loading ? "Getting location..." : "Near Me"}
              </div>
              <div className="text-xs text-gray-500">
                Events within 10km radius
              </div>
            </div>
          </button>

          {error && (
            <div className="px-4 py-3 bg-red-50 border-t border-red-100">
              <p className="text-xs text-red-600">
                {error.code === 1
                  ? "Location permission denied"
                  : "Failed to get location"}
              </p>
            </div>
          )}

          {location && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Current: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default LocationDropdown;
