"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook for auto-saving form data
 * Saves to localStorage every 30 seconds
 */
export function useAutoSave(formData, eventId = null, enabled = true) {
  const timeoutRef = useRef(null);
  const SAVE_DELAY = 30000; // 30 seconds

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      const key = eventId ? `draft_event_${eventId}` : "draft_event_new";
      localStorage.setItem(
        key,
        JSON.stringify({
          ...formData,
          lastSaved: new Date().toISOString(),
        })
      );
      console.log("Auto-saved draft at", new Date().toLocaleTimeString());
    }, SAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, eventId, enabled]);

  const loadDraft = (eventId = null) => {
    const key = eventId ? `draft_event_${eventId}` : "draft_event_new";
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  };

  const clearDraft = (eventId = null) => {
    const key = eventId ? `draft_event_${eventId}` : "draft_event_new";
    localStorage.removeItem(key);
  };

  return { loadDraft, clearDraft };
}
