import { api } from "../api";

/**
 * Get accepted payment methods for an event
 */
export const getPaymentMethods = async (eventId) => {
  const response = await api.get(`/events/${eventId}/payment-methods`);
  return response.data;
};

/**
 * Create a payment record and get payment URL
 */
export const createPayment = async (data) => {
  const response = await api.post("/payments", data);
  return response.data;
};

/**
 * Get payment details
 */
export const getPayment = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

/**
 * Verify payment status (webhook simulation)
 */
export const verifyPayment = async (paymentId) => {
  const response = await api.post(`/payments/${paymentId}/verify`);
  return response.data;
};
