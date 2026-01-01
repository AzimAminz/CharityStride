"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEventDetail } from "../../../../hooks/useEventDetail";
import { registerDonation } from "../../../../lib/events";
import {
  ArrowLeft,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { FeeInput } from "../../../../components/inputs";

export default function DonationRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id, true);

  const [formData, setFormData] = useState({
    amount: null, // in cents
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  if (!event.is_published) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">
            Event Not Available
          </p>
          <p className="text-gray-600 mb-4">
            This event is not currently open for donations.
          </p>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        event_id: parseInt(id),
        amount_paid: formData.amount,
      };

      const response = await registerDonation(id, payload);

      if (response.requires_payment && response.payment_id) {
        router.push(`/payment/mock/${response.payment_id}`);
      } else {
        router.push("/user/registrations");
      }
    } catch (error) {
      console.error("Donation registration error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit donation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-rose-100 rounded-2xl mb-2">
            <Heart className="h-6 w-6 text-rose-600 fill-rose-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">
            Support Our Cause
          </h1>
          <p className="text-gray-600">{event.title}</p>
        </div>

        {/* Poster Card */}
        {event.donation_config?.poster_url && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[1/1.4] w-full">
              <Image
                src={event.donation_config.poster_url}
                alt="Donation Poster"
                fill
                className="object-contain bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Donation Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-center font-bold text-gray-900 text-lg">
                Enter Donation Amount
              </label>

              <div className="relative">
                <FeeInput
                  value={formData.amount}
                  onChange={(val) => {
                    setFormData({ amount: val });
                    if (errors.amount) setErrors({});
                  }}
                  className="w-full"
                  placeholder="0.00"
                />
              </div>

              {errors.amount && (
                <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
                  <AlertCircle className="h-4 w-4" />
                  {errors.amount}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Complete Donation
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Securely processed via our payment gateway.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
