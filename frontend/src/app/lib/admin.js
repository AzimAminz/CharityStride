/**
 * Admin API Functions
 * Handles all admin-related API calls for NGO management
 */

import { api } from "./api";

/**
 * Get NGOs list with filters
 * @param {Object} params - Query parameters
 * @param {string} params.status - Status filter (pending|approved|rejected|blocked)
 * @param {string} params.search - Search query
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @returns {Promise<Object>} Response with data and meta
 */
export const getAdminNgos = async ({
  status,
  search = "",
  page = 1,
  per_page = 10,
}) => {
  const params = new URLSearchParams();

  if (status) params.append("status", status);
  if (search) params.append("search", search);
  params.append("page", page.toString());
  params.append("per_page", per_page.toString());

  const res = await api.get(`/admin/ngos?${params.toString()}`);
  return res.data;
};

/**
 * Get NGO details
 * @param {number} id - NGO ID
 * @returns {Promise<Object>} NGO details with user info
 */
export const getAdminNgoDetail = async (id) => {
  const res = await api.get(`/admin/ngos/${id}`);
  return res.data;
};

/**
 * Update NGO status
 * @param {number} id - NGO ID
 * @param {string} status - New status (pending|approved|rejected|blocked)
 * @returns {Promise<Object>} Updated NGO data
 */
export const updateNgoStatus = async (id, status) => {
  const res = await api.patch(`/admin/ngos/${id}/status`, { status });
  return res.data;
};
