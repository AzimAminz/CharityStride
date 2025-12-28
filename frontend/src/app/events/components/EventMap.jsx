"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to recenter map when user location changes (only once on initial load)
function MapController({ center, shouldRecenter }) {
  const map = useMap();

  useEffect(() => {
    if (center && shouldRecenter) {
      map.setView(center, 16 );
    }
  }, [center, map, shouldRecenter]);

  return null;
}

// Get marker color based on event categories
const getMarkerColor = (event) => {
  const categories = [];
  if (event.has_volunteer) categories.push("volunteer");
  if (event.has_donation) categories.push("donation");
  if (event.has_participant) categories.push("participant");

  if (categories.length > 1) return "#8B5CF6"; // Purple - multiple
  if (categories.includes("volunteer")) return "#3B82F6"; // Blue
  if (categories.includes("donation")) return "#10B981"; // Green
  if (categories.includes("participant")) return "#F59E0B"; // Orange
  return "#6B7280"; // Gray - default
};

// Create custom marker icon
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Create user location marker icon
const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function EventMap({
  events,
  selectedCategories,
  onLocationChange,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([3.139, 101.6869]); // Default: Kuala Lumpur
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [shouldRecenter, setShouldRecenter] = useState(true); // Only recenter on initial load

  // Auto-detect user location on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location);

          // Notify parent component about location change
          if (onLocationChange) {
            onLocationChange({ lat: latitude, lng: longitude });
          }

          // After initial centering, disable auto-recenter to allow free panning
          setTimeout(() => setShouldRecenter(false), 1000);
        },
        (error) => {
          console.log(
            "Location permission denied or unavailable, using default location"
          );
          // Disable auto-recenter even on error
          setShouldRecenter(false);
        }
      );
    } else {
      setShouldRecenter(false);
    }
  }, [onLocationChange]);

  // Filter events based on selected categories
  const filteredEvents = events.filter((event) => {
    if (selectedCategories.volunteer && event.has_volunteer) return true;
    if (selectedCategories.donation && event.has_donation) return true;
    if (selectedCategories.participant && event.has_participant) return true;
    // If no categories selected, show all
    if (
      !selectedCategories.volunteer &&
      !selectedCategories.donation &&
      !selectedCategories.participant
    ) {
      return true;
    }
    return false;
  });

  // Get user's current location (manual trigger)
  const handleUseMyLocation = () => {
    setIsLoadingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location);
          setIsLoadingLocation(false);

          // Temporarily enable recentering for manual location button click
          setShouldRecenter(true);
          setTimeout(() => setShouldRecenter(false), 1000);

          // Notify parent component about location change
          if (onLocationChange) {
            onLocationChange({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please enable location services."
          );
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Use My Location Button */}
      <button
        onClick={handleUseMyLocation}
        disabled={isLoadingLocation}
        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-[1000] bg-white px-3 sm:px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs sm:text-sm"
      >
        {isLoadingLocation ? (
          <>
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="hidden sm:inline font-medium">
              Getting location...
            </span>
            <span className="sm:hidden font-medium">Loading...</span>
          </>
        ) : (
          <>
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="hidden sm:inline font-medium">
              Use My Location
            </span>
            <span className="sm:hidden font-medium">My Location</span>
          </>
        )}
      </button>

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        className="w-full h-full rounded-lg"
        style={{ height: "400px", minHeight: "400px" }}
      >
        <MapController center={mapCenter} shouldRecenter={shouldRecenter} />

        {/* OpenStreetMap Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-sm font-medium">Your Location</div>
              </Popup>
            </Marker>

            {/* 10km Radius Circle */}
            <Circle
              center={userLocation}
              radius={10000} // 10km in meters
              pathOptions={{
                color: "#3B82F6",
                fillColor: "#3B82F6",
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          </>
        )}

        {/* Event Markers */}
        {filteredEvents.map((event) => {
          if (!event.latitude || !event.longitude) return null;

          const markerColor = getMarkerColor(event);
          const icon = createCustomIcon(markerColor);

          return (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="w-48">
                  {event.thumbnail && (
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-t"
                    />
                  )}
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">
                      {event.title}
                    </h3>
                    <a
                      href={`/events/${event.id}`}
                      className="text-blue-600 text-xs hover:underline inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Details
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-[1000] bg-white p-2 sm:p-3 rounded-lg shadow-lg">
        <div className="text-xs font-semibold text-gray-700 mb-1 sm:mb-2">
          Legend
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3B82F6]"></div>
            <span className="text-xs text-gray-600">Volunteer</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#10B981]"></div>
            <span className="text-xs text-gray-600">Donation</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#F59E0B]"></div>
            <span className="text-xs text-gray-600">Participant</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#8B5CF6]"></div>
            <span className="text-xs text-gray-600">Multiple</span>
          </div>
        </div>
      </div>
    </div>
  );
}
