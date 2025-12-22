import { useState, useEffect } from "react";
import {
  getParticipantCategories,
  checkCategoryCapacity,
} from "../lib/api/participants";

/**
 * Custom hook for managing participant registration flow
 */
export function useParticipantFlow(eventId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getParticipantCategories(eventId);
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);

      // FALLBACK: Use empty array for now (data comes from event object in preview page)
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [eventId]);

  const selectFeeTierByAge = (category, userAge) => {
    if (!category.fee_tiers || category.fee_tiers.length === 0) {
      return null;
    }

    // Find matching tier based on age range
    const matchingTier = category.fee_tiers.find((tier) => {
      const minAge = tier.min_age || 0;
      const maxAge = tier.max_age || 999;
      return userAge >= minAge && userAge <= maxAge;
    });

    // Fallback to first tier if no match
    return matchingTier || category.fee_tiers[0];
  };

  const checkCapacity = async (categoryId) => {
    try {
      const capacityData = await checkCategoryCapacity(categoryId);
      return capacityData;
    } catch (err) {
      console.error("Error checking capacity:", err);
      return null;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    selectFeeTierByAge,
    checkCapacity,
  };
}
