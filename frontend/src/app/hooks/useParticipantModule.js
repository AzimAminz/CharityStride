"use client";

import { useState, useEffect } from "react";
import {
  getParticipantConfig,
  saveParticipantConfig,
  getParticipantCategories,
  createParticipantCategory,
  updateParticipantCategory,
  deleteParticipantCategory,
  getFeeTiers,
  createFeeTier,
  updateFeeTier,
  deleteFeeTier,
} from "../lib/api/participant";

/**
 * Hook for managing participant module state
 */
export function useParticipantModule(eventId) {
  const [config, setConfig] = useState({
    participation_type: "free_event",
    slot_limit_type: "unlimited",
    total_slots: null,
  });
  const [categories, setCategories] = useState([]);
  const [feeTiers, setFeeTiers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load participant data on mount
  useEffect(() => {
    if (eventId) {
      loadParticipantData();
    }
  }, [eventId]);

  const loadParticipantData = async () => {
    setLoading(true);
    setError(null);
    try {
      const configData = await getParticipantConfig(eventId);
      setConfig(
        configData || {
          participation_type: "free_event",
          slot_limit_type: "unlimited",
          total_slots: null,
        }
      );

      const categoriesData = await getParticipantCategories(eventId);
      setCategories(categoriesData || []);

      // Load fee tiers for each category
      const tiersData = {};
      for (const category of categoriesData || []) {
        tiersData[category.id] = category.fee_tiers || [];
      }
      setFeeTiers(tiersData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load participant config"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const result = await saveParticipantConfig(eventId, newConfig);
      setConfig(result); // Backend returns config directly
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update config");
      throw err;
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const result = await createParticipantCategory(eventId, categoryData);
      setCategories((prev) => [...prev, result]); // Backend returns category directly
      setFeeTiers((prev) => ({ ...prev, [result.id]: [] }));
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
      throw err;
    }
  };

  const updateCat = async (categoryId, categoryData) => {
    try {
      const result = await updateParticipantCategory(
        eventId,
        categoryId,
        categoryData
      );
      setCategories(
        (prev) => prev.map((cat) => (cat.id === categoryId ? result : cat)) // Backend returns category directly
      );
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
      throw err;
    }
  };

  const removeCategory = async (categoryId) => {
    try {
      await deleteParticipantCategory(eventId, categoryId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      setFeeTiers((prev) => {
        const newTiers = { ...prev };
        delete newTiers[categoryId];
        return newTiers;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
      throw err;
    }
  };

  const addTier = async (categoryId, tierData) => {
    try {
      const result = await createFeeTier(eventId, categoryId, tierData);
      setFeeTiers((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), result], // Backend returns tier directly
      }));
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create fee tier");
      throw err;
    }
  };

  const updateTier = async (tierId, tierData) => {
    try {
      const result = await updateFeeTier(eventId, tierId, tierData);
      // Find which category this tier belongs to and update
      setFeeTiers((prev) => {
        const newTiers = { ...prev };
        for (const categoryId in newTiers) {
          newTiers[categoryId] = newTiers[categoryId].map(
            (t) => (t.id === tierId ? result : t) // Backend returns tier directly
          );
        }
        return newTiers;
      });
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update fee tier");
      throw err;
    }
  };

  const removeTier = async (categoryId, tierId) => {
    try {
      await deleteFeeTier(eventId, tierId);
      setFeeTiers((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter((t) => t.id !== tierId),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete fee tier");
      throw err;
    }
  };

  return {
    config,
    categories,
    feeTiers,
    loading,
    error,
    updateConfig,
    addCategory,
    updateCat,
    removeCategory,
    addTier,
    updateTier,
    removeTier,
    reload: loadParticipantData,
  };
}
