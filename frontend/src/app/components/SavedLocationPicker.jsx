"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Bookmark,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  Crosshair,
} from "lucide-react";
import LocationPicker from "../components/LocationPicker";
import { api } from "../lib/api";

/**
 * Location Picker with Saved Locations Feature
 * Allows NGOs to save frequently used locations and quickly reuse them
 */
export default function SavedLocationPicker({ value, onChange, placeholder }) {
  const [savedLocations, setSavedLocations] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSavedLocations = async () => {
    try {
      const response = await api.get("/ngo/saved-locations");
      setSavedLocations(response.data || []);
    } catch (error) {
      console.error("Failed to load saved locations:", error);
    }
  };

  const handleSaveLocation = async () => {
    if (!saveName.trim()) {
      alert("Please enter a name for this location");
      return;
    }

    setLoading(true);
    try {
      await api.post("/ngo/saved-locations", {
        name: saveName,
        address: value.address,
        latitude: value.latitude,
        longitude: value.longitude,
      });
      setSaveName("");
      setShowSaveDialog(false);
      await loadSavedLocations();
      alert("Location saved successfully!");
    } catch (error) {
      alert("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSaved = (location) => {
    onChange({
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const handleDeleteSaved = async (id) => {
    if (!confirm("Delete this saved location?")) return;

    try {
      await api.delete(`/ngo/saved-locations/${id}`);
      await loadSavedLocations();
    } catch (error) {
      alert("Failed to delete location");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Check if Google Maps is available
    if (!window.google || !window.google.maps) {
      alert(
        "Google Maps is still loading. Please wait a moment and try again."
      );
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            onChange({
              latitude: lat,
              longitude: lng,
              address: results[0].formatted_address,
            });
            setGettingLocation(false);
          } else {
            setGettingLocation(false);
            alert(
              "Could not get address for your location. Geocoding failed: " +
                status +
                "\nPlease use the search box to select your location instead."
            );
          }
        });
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = "Unable to retrieve your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        alert(errorMessage);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Saved Locations Dropdown - Enhanced Design */}
      {savedLocations.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Bookmark className="h-4 w-4 text-emerald-600" />
            Quick Select Saved Location
          </label>

          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-all shadow-sm text-left flex items-center justify-between group"
            >
              <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                📍 Choose from {savedLocations.length} saved location
                {savedLocations.length > 1 ? "s" : ""}...
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-emerald-300 rounded-lg shadow-xl max-h-80 overflow-y-auto custom-scrollbar">
                {savedLocations.map((loc, index) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      handleSelectSaved(loc);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-all flex items-start gap-3 group/item ${
                      index !== savedLocations.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <Bookmark className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover/item:text-emerald-700 transition-colors">
                        {loc.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        {loc.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manage Saved Locations - Enhanced Expandable Section */}
        </div>
      )}

      {/* Selected Address Display with Clear Button - Enhanced */}
      {value.address && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Selected Location
          </label>
          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-lg group shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-relaxed p-1">
                {value.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange({
                  address: "",
                  latitude: null,
                  longitude: null,
                });
              }}
              className="flex-shrink-0 p-2 hover:bg-red-100 rounded-lg transition-all hover:scale-110 group-hover:opacity-100 opacity-70"
              title="Clear location"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Location Picker Section */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <MapPin className="h-4 w-4 text-blue-600" />
          Search New Location
        </label>

        {/* Get Current Location Button - Prominent */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-700 hover:border-blue-800"
        >
          <Crosshair
            className={`h-5 w-5 ${
              gettingLocation
                ? "animate-spin"
                : "group-hover:scale-110 transition-transform"
            }`}
          />
          {gettingLocation
            ? "Getting your location..."
            : "📍 Use My Current Location"}
        </button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <LocationPicker
          value={value}
          onLocationSelect={onChange}
          placeholder={placeholder || "🔍 Search for location..."}
        />
      </div>

      {/* Save Current Location Button - Enhanced */}
      {value.address &&
        value.latitude &&
        value.longitude &&
        !showSaveDialog && (
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 border-2 border-emerald-300 rounded-lg hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Save this location for future use
          </button>
        )}

      {/* Save Dialog - Enhanced */}
      {showSaveDialog && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Bookmark className="h-4 w-4 text-emerald-700" />
            </div>
            <h4 className="font-semibold text-gray-900">Save this location</h4>
          </div>

          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Location Name *
          </label>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g., Main Office, Community Center, Event Hall"
            className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3 transition-all"
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSaveLocation();
            }}
            autoFocus
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={loading || !saveName.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
            >
              <Check className="h-4 w-4" />
              {loading ? "Saving..." : "Save Location"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName("");
              }}
              className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}
