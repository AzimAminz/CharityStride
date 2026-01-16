import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get published events with filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search query
 * @param {string} params.category - Category filter (volunteer, donation, participant)
 * @param {string} params.sort - Sort option (newest, popular, ending_soon, nearest)
 * @param {number} params.lat - Latitude for geofencing
 * @param {number} params.lng - Longitude for geofencing
 * @param {number} params.radius - Radius in km (default 10)
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 */
export const getEvents = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/public/events`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

/**
 * Get popular events (top 8)
 */
export const getPopularEvents = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/public/events/popular`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching popular events:", error);
    throw error;
  }
};

/**
 * Get newest events (top 4)
 */
export const getNewestEvents = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/public/events/newest`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching newest events:", error);
    throw error;
  }
};

/**
 * Get donation-only events (top 8)
 */
export const getDonationEvents = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/public/events/donations`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching donation events:", error);
    throw error;
  }
};

/**
 * Get search suggestions for autocomplete
 * @param {string} query - Search query (can be empty)
 * @param {string} state - State filter (default: 'all')
 */
export const getSearchSuggestions = async (query = "", state = "all") => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/public/events/suggestions`,
      {
        params: { q: query, state },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw error;
  }
};

/**
 * Get single event details
 * @param {number} id - Event ID
 */
export const getEventById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/public/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

/**
 * Get platform-wide statistics
 */
export const getPlatformStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/public/events/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    throw error;
  }
};
