import { api } from "../api";

/**
 * Get donation options (money and item) for an event
 */
export const getDonationOptions = async (eventId) => {
  const response = await api.get(`/events/${eventId}/donation-options`);
  return response.data;
};

/**
 * Submit donation registration
 */
export const submitDonation = async (data) => {
  const response = await api.post("/donation-registrations", data);
  return response.data;
};

/**
 * Get user's donations for an event
 */
export const getUserDonations = async (eventId) => {
  const response = await api.get(`/events/${eventId}/my-donations`);
  return response.data;
};
