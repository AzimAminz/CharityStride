// src/app/ngo/events/create/components/LocationDateSection.jsx
import { MapPin, Navigation } from "lucide-react";

const LocationDateSection = ({
  formData,
  mapSearch,
  isSearching,
  isGettingLocation,
  locationError,
  mapRef,
  handleInputChange,
  handleMapSearchChange,
  handleGetCurrentLocation,
  eventType
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Location Details</h2>
      <p className="text-sm text-gray-600 mb-6">
        Set the exact location coordinates for your event. This will be used for attendance tracking and directions.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Address *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="Full address of the event venue"
            />
          </div>

          {/* Map Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Location on Map
            </label>
            <div className="relative">
              <input
                id="map-search"
                type="text"
                value={mapSearch}
                onChange={handleMapSearchChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors pr-32"
                placeholder="Search for location, landmark, or address..."
              />
              
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isSearching ? "Searching..." : "Type to search or click on the map to set pin"}
            </p>
          </div>

          {/* Current Location Button */}
          <div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Current Location
                </>
              )}
            </button>
            
            {locationError && (
              <p className="text-sm text-red-600 mt-2">{locationError}</p>
            )}
            
            {/* Display Coordinates */}
            {formData.latitude && formData.longitude && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-1">Current Coordinates</p>
                <div className="text-sm text-gray-600">
                  Latitude: {formData.latitude.toFixed(6)}<br />
                  Longitude: {formData.longitude.toFixed(6)}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  These coordinates will be used for geofencing attendance tracking.
                </p>
              </div>
            )}
          </div>

          {/* Additional Info untuk event types tertentu */}
          {eventType === 'food_donation' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Food Donation Collection Point
                  </p>
                  <p className="text-sm text-blue-700">
                    This location is where volunteers will collect the donated food.
                    Ensure it's accessible and has clear instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Map */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Set Location on Map
            </label>
            <div className="text-xs text-gray-500">
              Drag pin to adjust
            </div>
          </div>
          <div 
            ref={mapRef}
            className="w-full h-80 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center"
          >
            {isGettingLocation ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Getting your location...</p>
              </div>
            ) : (
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Map will load here</p>
                <p className="text-xs text-gray-500 mt-1">Search for a location to begin</p>
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Click on the map or drag the pin to set exact location
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDateSection;