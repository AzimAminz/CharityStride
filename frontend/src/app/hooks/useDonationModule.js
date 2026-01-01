"use client";

import { useState, useEffect } from "react";
import { getDonationConfig, saveDonationConfig } from "../lib/api/donation";

/**
 * Hook for managing donation module state
 * Modified: Only handles config (money), removed item options.
 */
export function useDonationModule(eventId) {
  const [config, setConfig] = useState({
    accepts_money: false,
    accepts_items: false,
    target_amount: null,
    poster_url: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load donation data on mount
  useEffect(() => {
    if (eventId) {
      loadDonationData();
    }
  }, [eventId]);

  const loadDonationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const configData = await getDonationConfig(eventId);
      setConfig(configData || { accepts_money: false, accepts_items: false });
    } catch (err) {
      console.error("❌ Load donation data error:", err);
      setError(err.response?.data?.message || "Failed to load donation config");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const result = await saveDonationConfig(eventId, newConfig);
      setConfig(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update config");
      throw err;
    }
  };

  return {
    config,
    loading,
    error,
    updateConfig,
    reload: loadDonationData,
  };
}
