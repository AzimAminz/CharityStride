import { useState, useEffect } from "react";

const STORAGE_KEY = "charityStride_searchHistory";
const MAX_HISTORY_ITEMS = 10;

/**
 * Custom hook for managing search history using localStorage
 * @returns {object} - Methods to manage search history
 */
export function useSearchHistory() {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  /**
   * Add a search query to history
   * @param {string} query - The search query to add
   */
  const addToHistory = (query) => {
    if (!query || query.trim() === "") return;

    try {
      const newHistory = [
        {
          query: query.trim(),
          timestamp: Date.now(),
        },
        // Remove duplicates and keep only unique queries
        ...history.filter((item) => item.query !== query.trim()),
      ].slice(0, MAX_HISTORY_ITEMS); // Keep only last 10 items

      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  /**
   * Get all search history
   * @returns {array} - Array of search history items
   */
  const getHistory = () => {
    return history;
  };

  /**
   * Remove a specific item from history
   * @param {string} query - The query to remove
   */
  const removeFromHistory = (query) => {
    try {
      const newHistory = history.filter((item) => item.query !== query);
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to remove from search history:", error);
    }
  };

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    try {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  return {
    history,
    addToHistory,
    getHistory,
    removeFromHistory,
    clearHistory,
  };
}
