"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useEventDetail } from "../../../../hooks/useEventDetail";
import {
  getMyRegistrationStatus,
  registerParticipant,
} from "../../../../lib/events";
import { ArrowLeft, Users, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import ErrorModal from "../../../../components/ErrorModal";

export default function ParticipantRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // Use public API endpoint for event data
  const { event, loading, error } = useEventDetail(id, true);

  // Registration status states
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    participant_category_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    tshirt_size: "",
    preferred_session: "",
    special_requirements: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Check registration status (user is already authenticated at this point)
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        if (id) {
          const status = await getMyRegistrationStatus(id);
          if (status.has_participant_registration) {
            setAlreadyRegistered(true);
            setShowErrorModal(true);
          }
        }
      } catch (err) {
        console.error("Error checking registration status:", err);
        // If error (e.g., not authenticated), redirect back to event page
        if (err.response?.status === 401) {
          router.push(`/events/${id}`);
        }
      } finally {
        setCheckingStatus(false);
      }
    };

    checkRegistrationStatus();
  }, [id, router]);

  if (checkingStatus || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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

  // Redirect if event is not published
  if (!event.is_published) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">
            Event Not Available
          </p>
          <p className="text-gray-600 mb-4">
            This event is not currently open for registration.
          </p>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const selectedCategory = event.participant_categories?.find(
    (cat) => cat.id === parseInt(formData.participant_category_id)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.participant_category_id) {
      newErrors.participant_category_id = "Please select a category";
    }

    if (!formData.emergency_contact_name) {
      newErrors.emergency_contact_name = "Emergency contact name is required";
    }

    if (!formData.emergency_contact_phone) {
      newErrors.emergency_contact_phone = "Emergency contact phone is required";
    }

    // T-shirt size required if selected category has event or finisher tshirt
    const categoryHasTshirt =
      selectedCategory?.has_event_tshirt ||
      selectedCategory?.has_finisher_tshirt;
    if (categoryHasTshirt && !formData.tshirt_size) {
      newErrors.tshirt_size = "Please select a t-shirt size";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // API call to submit registration
    try {
      const response = await registerParticipant(id, formData);

      // Handle success
      if (response.payment_url) {
        // Redirect to payment page
        window.location.href = response.payment_url;
      } else {
        // Free event success
        alert("Registration successful!");
        router.push("/user/registrations");
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Show error message
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      // You might want to set a global error state here or use an AlertModal
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Participant Registration
          </h1>
          <p className="text-lg text-gray-600">{event.title}</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Select Category
            </h2>

            <div className="space-y-3">
              {event.participant_categories?.map((category) => (
                <label
                  key={category.id}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.participant_category_id === category.id.toString()
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="participant_category_id"
                      value={category.id}
                      checked={
                        formData.participant_category_id ===
                        category.id.toString()
                      }
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {category.name}
                        </span>
                        {category.base_fee > 0 && (
                          <span className="text-teal-600 font-bold">
                            RM {(category.base_fee / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}
                      {category.capacity && (
                        <p className="text-xs text-gray-500 mt-1">
                          Capacity: {category.current_registrations || 0} /{" "}
                          {category.capacity}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {errors.participant_category_id && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.participant_category_id}
              </p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Emergency Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.emergency_contact_name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
                  } focus:ring-2 focus:outline-none transition-colors`}
                  placeholder="Enter contact name"
                />
                {errors.emergency_contact_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergency_contact_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.emergency_contact_phone
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
                  } focus:ring-2 focus:outline-none transition-colors`}
                  placeholder="Enter contact phone"
                />
                {errors.emergency_contact_phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.emergency_contact_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* T-Shirt Size (if category has tshirts) */}
          {(selectedCategory?.has_event_tshirt ||
            selectedCategory?.has_finisher_tshirt) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                T-Shirt Size *
              </h2>

              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, tshirt_size: size }));
                      setErrors((prev) => ({ ...prev, tshirt_size: "" }));
                    }}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      formData.tshirt_size === size
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {errors.tshirt_size && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tshirt_size}
                </p>
              )}
            </div>
          )}

          {/* Optional Fields */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Additional Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Session (Optional)
                </label>
                <input
                  type="text"
                  name="preferred_session"
                  value={formData.preferred_session}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-colors"
                  placeholder="e.g., Morning, Afternoon"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-colors resize-none"
                  placeholder="Any dietary restrictions, medical conditions, or special needs..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Complete Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Already Registered Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Already Registered"
        message="You have already registered as a participant for this event. You can view your registration details in your profile."
        actionText="View Event Details"
        onAction={() => router.push(`/events/${id}`)}
      />
    </div>
  );
}
