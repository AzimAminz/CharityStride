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
    setLoading(true);
    setError(null);
    try {
      const configData = await getDonationConfig(eventId);
      setConfig(configData || { accepts_money: false, accepts_items: false });

      const money = await getMoneyOptions(eventId);
      setMoneyOptions(money || []);

      const items = await getItemOptions(eventId);
      setItemOptions(items || []);
    } catch (err) {
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
    try {
      await deleteMoneyOption(eventId, optionId);
      setMoneyOptions((prev) => prev.filter((opt) => opt.id !== optionId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete money option");
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
      setError(err.response?.data?.message || "Failed to delete item option");
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
