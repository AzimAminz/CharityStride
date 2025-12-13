import { useState, useEffect, useCallback, useRef } from "react";
import { getAdminNgos } from "../lib/admin";

/**
 * Custom hook for managing admin NGO data across all statuses
 * Handles fetching, searching (with debounce), and pagination for each status column
 */
export function useAdminNgos() {
  // State for each status column
  const [columns, setColumns] = useState({
    pending: { data: [], loading: true, pagination: null, search: "" },
    approved: { data: [], loading: true, pagination: null, search: "" },
    rejected: { data: [], loading: true, pagination: null, search: "" },
    blocked: { data: [], loading: true, pagination: null, search: "" },
  });

  // Store debounce timers
  const searchTimers = useRef({});

  /**
   * Fetch NGOs for a specific status
   */
  const fetchNgos = useCallback(async (status, page = 1, search = "") => {
    setColumns((prev) => ({
      ...prev,
      [status]: { ...prev[status], loading: true },
    }));

    try {
      const result = await getAdminNgos({ status, search, page, per_page: 10 });

      setColumns((prev) => ({
        ...prev,
        [status]: {
          ...prev[status],
          data: result.data,
          pagination: result.meta,
          loading: false,
        },
      }));
    } catch (error) {
      console.error(`Error fetching ${status} NGOs:`, error);
      setColumns((prev) => ({
        ...prev,
        [status]: { ...prev[status], loading: false },
      }));
    }
  }, []);

  /**
   * Handle search with 500ms debounce
   */
  const handleSearch = useCallback(
    (status, query) => {
      // Update search value immediately for UI
      setColumns((prev) => ({
        ...prev,
        [status]: { ...prev[status], search: query },
      }));

      // Clear existing timer
      if (searchTimers.current[status]) {
        clearTimeout(searchTimers.current[status]);
      }

      // Set new timer
      searchTimers.current[status] = setTimeout(() => {
        fetchNgos(status, 1, query);
      }, 500);
    },
    [fetchNgos]
  );

  /**
   * Handle page change
   */
  const handlePageChange = useCallback(
    (status, page) => {
      const search = columns[status].search;
      fetchNgos(status, page, search);
    },
    [columns, fetchNgos]
  );

  /**
   * Refresh specific status column (e.g., after status update)
   */
  const refreshStatus = useCallback(
    (status) => {
      const search = columns[status].search;
      const page = columns[status].pagination?.current_page || 1;
      fetchNgos(status, page, search);
    },
    [columns, fetchNgos]
  );

  /**
   * Refresh all columns
   */
  const refreshAll = useCallback(() => {
    Object.keys(columns).forEach((status) => {
      const search = columns[status].search;
      const page = columns[status].pagination?.current_page || 1;
      fetchNgos(status, page, search);
    });
  }, [columns, fetchNgos]);

  // Initial fetch for all statuses
  useEffect(() => {
    fetchNgos("pending");
    fetchNgos("approved");
    fetchNgos("rejected");
    fetchNgos("blocked");
  }, [fetchNgos]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(searchTimers.current).forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, []);

  return {
    columns,
    handleSearch,
    handlePageChange,
    refreshStatus,
    refreshAll,
  };
}
