"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useEventDetail } from "../../../../../../hooks/useEventDetail";
import { ArrowLeft, Heart, Clock } from "lucide-react";

export default function NGOVolunteerPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id);

  const [formData, setFormData] = useState({
    volunteer_role_id: "",
    volunteer_shift_id: "",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
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

  const selectedRole = event.volunteer_roles?.find(
    (role) => role.id === parseInt(formData.volunteer_role_id)
  );

  const availableShifts = selectedRole?.shifts || [];

  // Group shifts by date for better UX
  const shiftsByDate = availableShifts.reduce((acc, shift) => {
    const date = shift.shift_date || "No Date";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(shiftsByDate).sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "volunteer_role_id") {
      setFormData((prev) => ({ ...prev, volunteer_shift_id: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Preview Banner */}
      <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-semibold">
        📋 NGO PREVIEW MODE - This is how the form will appear to volunteers
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
            Volunteer Registration
          </h1>
          <p className="text-lg text-gray-600">{event.title}</p>
        </div>

        {/* Form Preview */}
        <div className="space-y-8">
          {/* Role Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Select Volunteer Role
            </h2>

            <div className="space-y-3">
              {event.volunteer_roles?.map((role) => (
                <label
                  key={role.id}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.volunteer_role_id === role.id.toString()
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="volunteer_role_id"
                      value={role.id}
                      checked={
                        formData.volunteer_role_id === role.id.toString()
                      }
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {role.custom_role_name || role.role_type?.name_en}
                      </div>
                      {role.role_description && (
                        <p className="text-sm text-gray-600">
                          {role.role_description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {role.shifts?.length || 0} shift(s) available
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Shift Selection */}
          {selectedRole && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Select Shift
              </h2>

              {sortedDates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No shifts available for this role
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedDates.map((date) => (
                    <div
                      key={date}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Date Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          📅{" "}
                          {date !== "No Date"
                            ? new Date(date).toLocaleDateString("en-MY", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Date Not Set"}
                          <span className="text-xs font-normal text-gray-500">
                            ({shiftsByDate[date].length} shift
                            {shiftsByDate[date].length > 1 ? "s" : ""})
                          </span>
                        </h3>
                      </div>

                      {/* Shifts for this date */}
                      <div className="p-3 space-y-2">
                        {shiftsByDate[date].map((shift) => (
                          <label
                            key={shift.id}
                            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.volunteer_shift_id ===
                              shift.id.toString()
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="volunteer_shift_id"
                                value={shift.id}
                                checked={
                                  formData.volunteer_shift_id ===
                                  shift.id.toString()
                                }
                                onChange={handleInputChange}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 mb-1">
                                  {shift.name}
                                </div>
                                {shift.description && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {shift.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                  {shift.shift_date && (
                                    <span className="font-semibold">
                                      📅{" "}
                                      {new Date(
                                        shift.shift_date
                                      ).toLocaleDateString("en-MY", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  )}
                                  {shift.start_time && (
                                    <span>🕐 {shift.start_time}</span>
                                  )}
                                  {shift.end_time && (
                                    <span>- {shift.end_time}</span>
                                  )}
                                </div>
                                {shift.total_capacity && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Capacity: {shift.current_volunteers || 0} /{" "}
                                    {shift.total_capacity}
                                  </p>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Experience Level */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Experience Level (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["beginner", "intermediate", "experienced"].map((level) => (
                <button
                  key={level}
                  type="button"
                  disabled
                  className="px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold capitalize"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* T-Shirt Size */}
          {event.event_tshirts?.length > 0 && (
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

          {/* Availability Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Availability Notes (Optional)
            </h2>
            <textarea
              disabled
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 resize-none"
              placeholder="Any specific availability constraints or preferences..."
            />
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
              className="flex-1 px-6 py-3 rounded-lg bg-gray-400 text-white font-bold cursor-not-allowed"
            >
              Complete Registration (Preview Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
