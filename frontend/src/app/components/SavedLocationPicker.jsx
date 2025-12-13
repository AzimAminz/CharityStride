"use client";

import { useState, useEffect } from "react";
import { MapPin, Bookmark, Plus, Trash2, Check } from "lucide-react";
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

  useEffect(() => {
    loadSavedLocations();
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

  return (
    <div className="space-y-3">
      {/* Saved Locations Dropdown */}
      {savedLocations.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quick Select Saved Location
          </label>
          <div className="grid grid-cols-1 gap-2">
            {savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-start justify-between p-2 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors group"
              >
                <div
                  onClick={() => handleSelectSaved(loc)}
                  className="flex items-start gap-2 flex-1 cursor-pointer"
                >
                  <Bookmark className="h-4 w-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {loc.name}
                    </p>
                    <p className="text-xs text-gray-600">{loc.address}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSaved(loc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Display (Read-only) */}
      {value.address && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Selected Address
          </label>
          <div className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
            <p className="text-sm text-gray-900">{value.address}</p>
          </div>
        </div>
      )}

      {/* Location Picker */}
      <div>
        <LocationPicker
          value={value}
          onChange={onChange}
          placeholder={placeholder || "Search for location..."}
        />
      </div>

      {/* Save Current Location */}
      {value.address &&
        value.latitude &&
        value.longitude &&
        !showSaveDialog && (
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Save this location for later
          </button>
        )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Name this location
          </label>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g., Main Office, Community Center"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 mb-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName("");
              }}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
