"use client";

import { useState, useEffect } from "react";
import { getEvents } from "../lib/events";

/**
 * Custom hook for fetching and managing events list
 */
export function useEvents(filters = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getEvents(filters);
      setEvents(data.data);
      setPagination({
        current_page: data.current_page,
        total: data.total,
        per_page: data.per_page,
        last_page: data.last_page,
      });
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters)]);

  return {
    events,
    loading,
    error,
    pagination,
    refetch: fetchEvents,
  };
}
