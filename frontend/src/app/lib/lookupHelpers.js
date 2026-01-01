/**
 * Lookup Data API Functions
 * Fetch lookup tables from backend
 */

import { api } from "./api";

/**
 * Fetch all lookup data at once
 * @returns {Promise<Object>} All lookup tables
 */
export async function fetchAllLookupData() {
  try {
    const response = await api.get("/lookups/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching lookup data:", error);
    return {
      volunteer_role_types: [],
      shift_types: [],
    };
  }
}

/**
 * Fetch volunteer role types
 * @returns {Promise<Array>} Volunteer role types
 */
export async function fetchVolunteerRoleTypes() {
  try {
    const response = await api.get("/lookups/volunteer-role-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching volunteer role types:", error);
    return [];
  }
}

/**
 * Fetch shift types
 * @returns {Promise<Array>} Shift types
 */
export async function fetchShiftTypes() {
  try {
    const response = await api.get("/lookups/shift-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching shift types:", error);
    return [];
  }
}
