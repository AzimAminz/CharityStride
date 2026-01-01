// Donation Module API
import { api } from "../api";

/**
 * Donation Config API
 */

// Create/Update donation config
export const saveDonationConfig = async (eventId, data) => {
  const res = await api.post(`/ngo/events/${eventId}/donation/config`, data);
  return res.data;
};

// Get donation config
export const getDonationConfig = async (eventId) => {
  const res = await api.get(`/ngo/events/${eventId}/donation/config`);
  return res.data;
};

/**
 * Item Donation Options API
 */

// Create item donation option
export const createItemOption = async (eventId, data) => {
  const res = await api.post(
    `/ngo/events/${eventId}/donation/item-options`,
    data
  );
  return res.data;
};

// Update item donation option
export const updateItemOption = async (eventId, optionId, data) => {
  const res = await api.put(
    `/ngo/events/${eventId}/donation/item-options/${optionId}`,
    data
  );
  return res.data;
};

// Delete item donation option
export const deleteItemOption = async (eventId, optionId) => {
  const res = await api.delete(
    `/ngo/events/${eventId}/donation/item-options/${optionId}`
  );
  return res.data;
};

// Get item donation options
export const getItemOptions = async (eventId) => {
  const res = await api.get(`/ngo/events/${eventId}/donation/item-options`);
  return res.data;
};

/**
 * Dropdown Options
 */

export const AMOUNT_TYPES = [
  { value: "fixed", label: "Fixed Amount" },
  { value: "free_amount", label: "Free Amount (Donor Decides)" },
  { value: "package", label: "Package/Bundle" },
];

export const PAYMENT_METHODS = [
  { value: "card", label: "Credit/Debit Card" },
  { value: "fpx", label: "FPX (Online Banking)" },
  { value: "cash", label: "Cash" },
];

export const ITEM_CATEGORIES = [
  { value: "food", label: "Food" },
  { value: "clothing", label: "Clothing" },
  { value: "medical_supplies", label: "Medical Supplies" },
  { value: "school_supplies", label: "School Supplies" },
];

export const QUANTITY_TYPES = [
  { value: "fixed", label: "Fixed Target Quantity" },
  { value: "flexible", label: "Flexible (Donor Decides)" },
];
