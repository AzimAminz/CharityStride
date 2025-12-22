import { api } from "../api";

/**
 * Get participant categories for an event with fee tiers
 */
export const getParticipantCategories = async (eventId) => {
  const response = await api.get(`/events/${eventId}/participant-categories`);
  return response.data;
};

/**
 * Check category capacity and availability
 */
export const checkCategoryCapacity = async (categoryId) => {
  const response = await api.get(
    `/participant-categories/${categoryId}/capacity`
  );
  return response.data;
};

/**
 * Submit participant registration
 */
export const submitParticipantRegistration = async (data) => {
  const response = await api.post("/participant-registrations", data);
  return response.data;
};

/**
 * Get user's existing registrations for an event
 */
export const getUserRegistrations = async (eventId) => {
  const response = await api.get(`/events/${eventId}/my-registrations`);
  return response.data;
};
