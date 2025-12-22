import { api } from "../api";

/**
 * Get volunteer roles for an event with shifts
 */
export const getVolunteerRoles = async (eventId) => {
  const response = await api.get(`/events/${eventId}/volunteer-roles`);
  return response.data;
};

/**
 * Get shifts for a specific volunteer role
 */
export const getVolunteerShifts = async (roleId) => {
  const response = await api.get(`/volunteer-roles/${roleId}/shifts`);
  return response.data;
};

/**
 * Submit volunteer registration
 */
export const submitVolunteerRegistration = async (data) => {
  const response = await api.post("/volunteer-registrations", data);
  return response.data;
};

/**
 * Get user's volunteer registrations for an event
 */
export const getUserVolunteerRegistrations = async (eventId) => {
  const response = await api.get(
    `/events/${eventId}/my-volunteer-registrations`
  );
  return response.data;
};
