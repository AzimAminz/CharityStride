// Participant Module API
import { api } from "../api";

/**
 * Participant Config API
 */

// Create/Update participant config
export const saveParticipantConfig = async (eventId, data) => {
  const res = await api.post(`/ngo/events/${eventId}/participant/config`, data);
  return res.data;
};

// Get participant config
export const getParticipantConfig = async (eventId) => {
  const res = await api.get(`/ngo/events/${eventId}/participant/config`);
  return res.data;
};

/**
 * Participant Categories API
 */

// Create participant category
export const createParticipantCategory = async (eventId, data) => {
  const res = await api.post(
    `/ngo/events/${eventId}/participant/categories`,
    data
  );
  return res.data;
};

// Update participant category
export const updateParticipantCategory = async (eventId, categoryId, data) => {
  const res = await api.put(
    `/ngo/events/${eventId}/participant/categories/${categoryId}`,
    data
  );
  return res.data;
};

// Delete participant category
export const deleteParticipantCategory = async (eventId, categoryId) => {
  const res = await api.delete(
    `/ngo/events/${eventId}/participant/categories/${categoryId}`
  );
  return res.data;
};

// Get participant categories
export const getParticipantCategories = async (eventId) => {
  const res = await api.get(`/ngo/events/${eventId}/participant/categories`);
  return res.data;
};

/**
 * Fee Tiers API
 */

// Create fee tier
export const createFeeTier = async (eventId, categoryId, data) => {
  const res = await api.post(
    `/ngo/events/${eventId}/participant/categories/${categoryId}/tiers`,
    data
  );
  return res.data;
};

// Update fee tier
export const updateFeeTier = async (eventId, tierId, data) => {
  const res = await api.put(
    `/ngo/events/${eventId}/participant/tiers/${tierId}`,
    data
  );
  return res.data;
};

// Delete fee tier
export const deleteFeeTier = async (eventId, tierId) => {
  const res = await api.delete(
    `/ngo/events/${eventId}/participant/tiers/${tierId}`
  );
  return res.data;
};

// Get fee tiers for category
export const getFeeTiers = async (eventId, categoryId) => {
  const res = await api.get(
    `/ngo/events/${eventId}/participant/categories/${categoryId}/tiers`
  );
  return res.data;
};

/**
 * Dropdown Options
 */

export const PARTICIPATION_TYPES = [
  { value: "free_event", label: "Free Event (No Fee)" },
  { value: "paid_event", label: "Paid Event (Registration Fee)" },
];

export const SLOT_LIMIT_TYPES = [
  { value: "limited", label: "Limited Slots" },
  { value: "unlimited", label: "Unlimited Slots" },
];

export const CATEGORY_NAMES = [
  { value: "adult", label: "Adult" },
  { value: "student", label: "Student" },
  { value: "senior_citizen", label: "Senior Citizen" },
];

export const FEE_TYPES = [
  { value: "fixed", label: "Fixed Fee (Same for Everyone)" },
  { value: "tiered", label: "Tiered Pricing (Early Bird, Normal, etc.)" },
];

export const TIER_TYPES = [
  { value: "early_bird", label: "Early Bird" },
  { value: "normal", label: "Normal Registration" },
  { value: "late_registration", label: "Late Registration" },
];

export const TSHIRT_SIZES = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];
