"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEventDetail } from "../../../../../../hooks/useEventDetail";
import { ArrowLeft, Users, AlertCircle, CheckCircle } from "lucide-react";

export default function NGOParticipantPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id);

  const [formData, setFormData] = useState({
    participant_category_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    tshirt_size: "",
    preferred_session: "",
    special_requirements: "",
  });

  const [errors, setErrors] = useState({});

  if (loading) {
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

  // NO is_published check for NGO preview

  const selectedCategory = event.participant_categories?.find(
    (cat) => cat.id === parseInt(formData.participant_category_id)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Preview Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-semibold">
        📋 NGO PREVIEW MODE - This is how the form will appear to participants
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to Preview</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Participant Registration
          </h1>
          <p className="text-lg text-gray-600">{event.title}</p>
        </div>

        {/* Form Preview (Read-only) */}
        <div className="space-y-8">
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
                  className="block p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
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
                          {category.category_name}
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
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50"
                  placeholder="Enter contact phone"
                />
              </div>
            </div>
          </div>

          {/* T-Shirt Size (dynamic based on selected category) */}
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
                    disabled
                    className="px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold"
                  >
                    {size}
                  </button>
                ))}
              </div>
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
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50"
                  placeholder="e.g., Morning, Afternoon"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  disabled
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 resize-none"
                  placeholder="Any dietary restrictions, medical conditions, or special needs..."
                />
              </div>
            </div>
          </div>

          {/* Preview Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Back to Preview
            </button>
            <button
              type="button"
              disabled
              className="flex-1 px-6 py-3 rounded-lg bg-gray-400 text-white font-bold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Complete Registration (Preview Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
