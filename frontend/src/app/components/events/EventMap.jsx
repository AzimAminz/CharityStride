"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

// Fix for default marker icon in Next.js
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

export default function EventMap({
  latitude,
  longitude,
  locationName,
  zoom = 15,
  className = "",
}) {
  if (!latitude || !longitude) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-12 ${className}`}
      >
        <MapPin className="h-16 w-16 text-emerald-300 mb-4" />
        <p className="text-gray-500 font-medium">Location not available</p>
      </div>
    );
  }

  const position = [parseFloat(latitude), parseFloat(longitude)];

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${className}`}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full min-h-[300px]"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center py-2">
              <p className="font-bold text-gray-900 mb-1">{locationName}</p>
              <button
                onClick={openInGoogleMaps}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 mx-auto"
              >
                <Navigation className="h-3 w-3" />
                Get Directions
              </button>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Overlay Button for Directions */}
      <button
        onClick={openInGoogleMaps}
        className="absolute bottom-4 right-4 z-[1000] px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-bold text-gray-900"
      >
        <Navigation className="h-4 w-4 text-emerald-600" />
        Directions
      </button>
    </div>
  );
}
