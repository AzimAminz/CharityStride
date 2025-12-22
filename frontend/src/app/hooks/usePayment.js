import { useState, useEffect } from "react";
import { getPaymentMethods, createPayment } from "../lib/api/payments";
import { submitParticipantRegistration } from "../lib/api/participants";

/**
 * Custom hook for managing payment flow
 */
export function usePayment(eventId) {
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentMethods = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getPaymentMethods(eventId);
      setMethods(data.accepted_methods || ["fpx", "card", "ewallet"]);
      if (data.accepted_methods && data.accepted_methods.length > 0) {
        setSelectedMethod(data.accepted_methods[0]);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError(err.message);
      // Set defaults if API fails
      setMethods(["fpx", "card", "ewallet"]);
      setSelectedMethod("fpx");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [eventId]);

  const processParticipantPayment = async (registrationData, totalAmount) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Submit participant registrations
      const registrationResponse = await submitParticipantRegistration(
        registrationData
      );

      // 2. Create payment if required
      if (totalAmount > 0) {
        const paymentData = {
          registration_type: "participant",
          registration_id: registrationResponse.id,
          amount: totalAmount,
          payment_method: selectedMethod,
          event_id: eventId,
        };

        const paymentResponse = await createPayment(paymentData);

        return {
          success: true,
          registration: registrationResponse,
          payment: paymentResponse,
          requiresPayment: true,
        };
      }

      // No payment required (free registration)
      return {
        success: true,
        registration: registrationResponse,
        payment: null,
        requiresPayment: false,
      };
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    methods,
    selectedMethod,
    setSelectedMethod,
    loading,
    error,
    processParticipantPayment,
    fetchPaymentMethods,
  };
}
