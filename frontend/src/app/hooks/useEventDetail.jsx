"use client";

import { useState, useEffect } from "react";
import { getEvent, getPublicEvent } from "../lib/events";

/**
 * Custom hook for fetching single event details
 * @param {string} id - Event ID
 * @param {boolean} isPublic - If true, uses public API endpoint (no auth required)
 */
export function useEventDetail(id, isPublic = false) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = isPublic ? await getPublicEvent(id) : await getEvent(id);
      setEvent(data);
    } catch (err) {
      console.error("Error fetching event:", err);
      setError(err.response?.data?.message || "Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, isPublic]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}
