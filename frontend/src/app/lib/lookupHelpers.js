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
      participant_category_types: [],
      required_skills: [],
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
 * Fetch participant category types
 * @returns {Promise<Array>} Participant category types
 */
export async function fetchParticipantCategoryTypes() {
  try {
    const response = await api.get("/lookups/participant-category-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching participant category types:", error);
    return [];
  }
}

/**
 * Fetch required skills
 * @returns {Promise<Array>} Required skills
 */
export async function fetchRequiredSkills() {
  try {
    const response = await api.get("/lookups/required-skills");
    return response.data;
  } catch (error) {
    console.error("Error fetching required skills:", error);
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
