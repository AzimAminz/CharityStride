"use client";

import { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { MapPin, Search, Loader2 } from "lucide-react";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 3.139, // Kuala Lumpur
  lng: 101.6869,
};

export default function LocationPicker({
  onChange,
  initialLocation = null,
  address = "",
  placeholder,
  value,
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(
    initialLocation || defaultCenter
  );
  const [mapCenter, setMapCenter] = useState(initialLocation || defaultCenter);

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const onMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setMarkerPosition({ lat, lng });

      // Get address from coordinates using Geocoding
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressData = extractAddressComponents(results[0]);
          onChange({
            latitude: lat,
            longitude: lng,
            address: addressData.address,
          });
        } else {
          onChange({ latitude: lat, longitude: lng, address: "" });
        }
      });
    },
    [onChange]
  );

  // Extract city, state, postcode from address components
  const extractAddressComponents = (place) => {
    const components = place.address_components || [];
    let city = "";
    let state = "";
    let postcode = "";
    let address = place.formatted_address || "";

    components.forEach((component) => {
      const types = component.types;

      // City - locality or sublocality
      if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("sublocality") && !city) {
        city = component.long_name;
      }

      // State - administrative_area_level_1
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }

      // Postcode
      if (types.includes("postal_code")) {
        postcode = component.long_name;
      }
    });

    return { address, city, state, postcode };
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });

        const addressData = extractAddressComponents(place);
        onChange({
          latitude: lat,
          longitude: lng,
          address: addressData.address,
        });
      }
    }
  };

  const onMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setMarkerPosition({ lat, lng });

    // Get address from new position
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressData = extractAddressComponents(results[0]);
        onChange({
          latitude: lat,
          longitude: lng,
          address: addressData.address,
        });
      } else {
        onChange({ latitude: lat, longitude: lng, address: "" });
      }
    });
  };

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800 font-medium">Error loading Google Maps</p>
        <p className="text-sm text-red-600 mt-1">{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
        <span className="text-gray-600">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="relative">
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "my" }, // Restrict to Malaysia
            types: ["address"],
          }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder || "Search for location..."}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              defaultValue={value?.address || address}
            />
          </div>
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={mapCenter}
          onClick={onMapClick}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        </GoogleMap>

        {/* Instructions Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Set Your Location</p>
              <p className="text-gray-600">
                Search above, click on map, or drag the pin to set your exact
                location
              </p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}
