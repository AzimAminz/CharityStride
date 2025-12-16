"use client";

import { useState, useEffect } from "react";
import {
  getDonationConfig,
  saveDonationConfig,
  getMoneyOptions,
  createMoneyOption,
  updateMoneyOption,
  deleteMoneyOption,
  getItemOptions,
  createItemOption,
  updateItemOption,
  deleteItemOption,
} from "../lib/api/donation";

/**
 * Hook for managing donation module state
 */
export function useDonationModule(eventId) {
  const [config, setConfig] = useState({
    accepts_money: false,
    accepts_items: false,
  });
  const [moneyOptions, setMoneyOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load donation data on mount
  useEffect(() => {
    if (eventId) {
      loadDonationData();
    }
  }, [eventId]);

  const loadDonationData = async () => {
    console.log("📥 LOAD DONATION DATA CALLED for eventId:", eventId);
    setLoading(true);
    setError(null);
    try {
      const configData = await getDonationConfig(eventId);
      setConfig(configData || { accepts_money: false, accepts_items: false });

      const money = await getMoneyOptions(eventId);
      console.log("💰 Money options loaded:", money);
      setMoneyOptions(money || []);

      const items = await getItemOptions(eventId);
      console.log("📦 Item options loaded:", items);
      setItemOptions(items || []);
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

  const addMoneyOption = async (optionData) => {
    try {
      const result = await createMoneyOption(eventId, optionData);
      setMoneyOptions((prev) => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create money option");
      throw err;
    }
  };

  const updateMoneyOpt = async (optionId, optionData) => {
    try {
      const result = await updateMoneyOption(eventId, optionId, optionData);
      setMoneyOptions((prev) =>
        prev.map((opt) => (opt.id === optionId ? result : opt))
      );
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update money option");
      throw err;
    }
  };

  const removeMoneyOption = async (optionId) => {
    console.log("🗑️ DELETE MONEY OPTION CALLED");
    console.log("Option ID to delete:", optionId);
    console.log("Current money options before delete:", moneyOptions);

    try {
      await deleteMoneyOption(eventId, optionId);
      console.log("✅ Delete API call successful");

      const newOptions = moneyOptions.filter((opt) => opt.id !== optionId);
      console.log("New options after filter:", newOptions);

      setMoneyOptions(newOptions);
      console.log("State updated successfully");
    } catch (err) {
      console.error("❌ Delete money option error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to delete money option";
      setError(errorMsg);
      alert(errorMsg); // Show error to user
      throw err;
    }
  };

  const addItemOption = async (optionData) => {
    try {
      const result = await createItemOption(eventId, optionData);
      setItemOptions((prev) => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create item option");
      throw err;
    }
  };

  const updateItemOpt = async (optionId, optionData) => {
    try {
      const result = await updateItemOption(eventId, optionId, optionData);
      setItemOptions((prev) =>
        prev.map((opt) => (opt.id === optionId ? result : opt))
      );
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item option");
      throw err;
    }
  };

  const removeItemOption = async (optionId) => {
    try {
      await deleteItemOption(eventId, optionId);
      setItemOptions((prev) => prev.filter((opt) => opt.id !== optionId));
    } catch (err) {
      console.error("Delete item option error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to delete item option";
      setError(errorMsg);
      alert(errorMsg); // Show error to user
      throw err;
    }
  };

  return {
    config,
    moneyOptions,
    itemOptions,
    loading,
    error,
    updateConfig,
    addMoneyOption,
    updateMoneyOpt,
    removeMoneyOption,
    addItemOption,
    updateItemOpt,
    removeItemOption,
    reload: loadDonationData,
  };
}
