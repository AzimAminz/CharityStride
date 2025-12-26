"use client";

import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cached location from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("userLocation");
      if (cached) {
        try {
          setLocation(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached location:", e);
        }
      }
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError(new Error("Geolocation is not supported by your browser"));
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        setLocation(newLocation);
        setLoading(false);

        // Cache location
        if (typeof window !== "undefined") {
          localStorage.setItem("userLocation", JSON.stringify(newLocation));
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("userLocation");
    }
  };

  return {
    location,
    loading,
    error,
    requestLocation,
    clearLocation,
  };
};
