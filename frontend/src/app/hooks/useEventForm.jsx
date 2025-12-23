"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "../lib/events";

/**
 * Custom hook for event form management
 */
export function useEventForm(initialData = null) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      event_date: "",
      has_event_date: false,
      longitude: null,
      latitude: null,
      address: "",
      thumbnail: null,

      // Module enablers
      has_volunteer: false,
      has_donation: false,
      has_participant: false,

      // Event status
      status: "open",
      is_published: false,
    }
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (asDraft = true) => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (initialData?.id) {
        // Update existing
        result = await updateEvent(initialData.id, formData);
      } else {
        // Create new
        result = await createEvent(formData);
      }

      // Redirect to list or stay for sections
      if (asDraft) {
        router.push("/ngo/events");
      }

      return result;
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.response?.data?.message || "Failed to save event");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    loading,
    error,
  };
}
