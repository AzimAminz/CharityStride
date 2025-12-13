"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Simple Leaflet Map Component for NGO Location
 * @param {number} latitude - NGO latitude
 * @param {number} longitude - NGO longitude
 * @param {string} name - NGO name for popup
 */
export default function NgoLocationMap({ latitude, longitude, name }) {
  useEffect(() => {
    // Initialize map
    const map = L.map("ngo-map").setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${name}</b>`).openPopup();

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [latitude, longitude, name]);

  return (
    <div
      id="ngo-map"
      className="w-full h-80 rounded-lg border border-gray-200"
      style={{ zIndex: 0 }}
    />
  );
}
