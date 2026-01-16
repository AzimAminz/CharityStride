"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useEventDetail } from "../../../../hooks/useEventDetail";
import {
  getMyRegistrationStatus,
  registerVolunteer,
} from "../../../../lib/events";
import {
  ArrowLeft,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Ban,
} from "lucide-react";

export default function VolunteerRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // Use public API endpoint for event data
  const { event, loading, error } = useEventDetail(id, true);

  // Registration status states
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [registeredShiftIds, setRegisteredShiftIds] = useState([]);

  const [formData, setFormData] = useState({
    volunteer_role_id: "",
    volunteer_shift_id: "",
    experience_level: "",
    tshirt_size: "",
    availability_notes: "",
  });

  const [selectedDate, setSelectedDate] = useState(""); // For date filter dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Check registration status (user is already authenticated at this point)
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        if (id) {
          const status = await getMyRegistrationStatus(id);
          // Store registered shift IDs to disable them
          setRegisteredShiftIds(status.registered_volunteer_shift_ids || []);
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

  // Get today's date in YYYY-MM-DD format (Local client time)
  // Must be before early returns to support hooks using it
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // Debug log (Must be before early returns)
  useEffect(() => {
    if (event?.volunteer_roles) {
      // console.log("🛠️ Volunteer Filtering Debug:", {
      //   todayStr,
      //   totalRoles: event.volunteer_roles.length,
      //   loading,
      //   checkingStatus,
      // });
    }
  }, [event?.volunteer_roles, todayStr]);

  if (checkingStatus || loading) {
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  // Filter roles and their shifts
  const filteredRoles = (event.volunteer_roles || [])
    .map((role) => ({
      ...role,
      upcomingShifts: (role.shifts || []).filter((shift) => {
        if (!shift.shift_date) return true; // Keep shifts without dates

        // Normalize shift_date if it's an ISO string (e.g., from DB cast)
        const shiftDateStr =
          typeof shift.shift_date === "string"
            ? shift.shift_date.split("T")[0]
            : new Date(shift.shift_date).toISOString().split("T")[0];

        return shiftDateStr >= todayStr;
      }),
    }))
    .filter((role) => role.upcomingShifts.length > 0);

  const selectedRole = filteredRoles.find(
    (role) => role.id === parseInt(formData.volunteer_role_id)
  );

  const availableShifts = selectedRole?.upcomingShifts || [];

  // Group shifts by date for better UX
  const shiftsByDate = availableShifts.reduce((acc, shift) => {
    // Normalize date for grouping (YYYY-MM-DD)
    let dateKey = "No Date";
    if (shift.shift_date) {
      dateKey =
        typeof shift.shift_date === "string"
          ? shift.shift_date.split("T")[0]
          : new Date(shift.shift_date).toISOString().split("T")[0];
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(shift);
    return acc;
  }, {});

  const sortedDates = Object.keys(shiftsByDate).sort();

  // Filter by selected date if dropdown is used
  const displayDates = selectedDate ? [selectedDate] : sortedDates;

  // Helper function to convert 24h to 12h format
  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset shift when role changes
    if (name === "volunteer_role_id") {
      setFormData((prev) => ({ ...prev, volunteer_shift_id: "" }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.volunteer_role_id) {
      newErrors.volunteer_role_id = "Please select a volunteer role";
    }

    if (!formData.volunteer_shift_id) {
      newErrors.volunteer_shift_id = "Please select a shift";
    }

    if (selectedRole?.has_tshirt && !formData.tshirt_size) {
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

    try {
      const response = await registerVolunteer(id, formData);

      // Redirect to payment page with payment ID
      if (response.payment_id) {
        router.push(`/payments/${response.payment_id}`);
      } else {
        // If no payment required, redirect to success page
        router.push(`/user/registrations?success=volunteer`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        api:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
      setSubmitting(false);
    }
  };

  console.log(
    "🎨 [VolunteerRegistration] Rendering main form. Submitting:",
    submitting
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
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
            Volunteer Registration
          </h1>
          <p className="text-lg text-gray-600">{event.title}</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* API Error */}
          {errors.api && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{errors.api}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-600" />
              Select Volunteer Role
            </h2>

            <div className="space-y-3">
              {filteredRoles.map((role) => (
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
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {role.custom_role_name || role.role_type?.name_en}
                        </span>
                      </div>
                      {role.role_description && (
                        <p className="text-sm text-gray-600">
                          {role.role_description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {role.upcomingShifts?.length || 0} shift(s) available
                      </p>
                    </div>
                  </div>
                </label>
              ))}
              {filteredRoles.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">
                    No upcoming volunteer roles available for this event.
                  </p>
                </div>
              )}
            </div>

            {errors.volunteer_role_id && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.volunteer_role_id}
              </p>
            )}
          </div>

          {/* Shift Selection */}
          {selectedRole && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Select Shift
                </h2>

                {/* Custom Date Filter Dropdown */}
                {sortedDates.length > 1 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-sm font-medium bg-white transition-all flex items-center gap-2 min-w-[200px] justify-between"
                    >
                      <span>
                        {selectedDate ? (
                          <>
                            {new Date(selectedDate).toLocaleDateString(
                              "en-MY",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            ({shiftsByDate[selectedDate].length})
                          </>
                        ) : (
                          `All Dates (${sortedDates.length})`
                        )}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsDropdownOpen(false)}
                        />

                        <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDate("");
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-purple-50 transition-colors flex items-center justify-between ${
                              !selectedDate
                                ? "bg-purple-50 text-purple-700 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            <span>All Dates</span>
                            <span className="text-xs text-gray-500">
                              ({sortedDates.length})
                            </span>
                          </button>

                          <div className="border-t border-gray-200" />

                          {sortedDates.map((date) => (
                            <button
                              key={date}
                              type="button"
                              onClick={() => {
                                setSelectedDate(date);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-purple-50 transition-colors flex items-center justify-between ${
                                selectedDate === date
                                  ? "bg-purple-50 text-purple-700 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              <span>
                                {date !== "No Date"
                                  ? new Date(date).toLocaleDateString("en-MY", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Date Not Set"}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({shiftsByDate[date].length})
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {sortedDates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No shifts available for this role
                </p>
              ) : (
                <div className="space-y-4">
                  {displayDates.map((date) => (
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
                        {shiftsByDate[date].map((shift) => {
                          const isAlreadyRegistered =
                            registeredShiftIds.includes(shift.id);
                          const isFull =
                            shift.capacity &&
                            (shift.current_registrations || 0) >=
                              shift.capacity;
                          const isDisabled = isAlreadyRegistered || isFull;

                          return (
                            <label
                              key={shift.id}
                              className={`block p-4 rounded-lg border-2 transition-all ${
                                isDisabled
                                  ? "border-gray-200 bg-gray-50/50 cursor-not-allowed grayscale-[0.5]"
                                  : formData.volunteer_shift_id ===
                                    shift.id.toString()
                                  ? "border-purple-500 bg-purple-50 cursor-pointer"
                                  : "border-gray-200 hover:border-gray-300 cursor-pointer"
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
                                  disabled={isDisabled}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`font-semibold ${
                                          isDisabled
                                            ? "text-gray-500"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {shift.name}
                                      </span>
                                      {isAlreadyRegistered && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wider">
                                          <CheckCircle className="h-3 w-3" />
                                          Registered
                                        </span>
                                      )}
                                      {isFull && !isAlreadyRegistered && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wider">
                                          <Ban className="h-3 w-3" />
                                          Fully Booked
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      {shift.start_time && (
                                        <span
                                          className={`font-medium ${
                                            isDisabled
                                              ? "text-gray-400"
                                              : "text-purple-600"
                                          }`}
                                        >
                                          🕐 {formatTime12h(shift.start_time)}
                                        </span>
                                      )}
                                      {shift.end_time && (
                                        <span className="text-gray-500">
                                          - {formatTime12h(shift.end_time)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {shift.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {shift.description}
                                    </p>
                                  )}
                                  {shift.capacity && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      <div className="flex justify-between items-center mb-1">
                                        <span>Availability</span>
                                        <span className="font-medium">
                                          {shift.current_registrations || 0} /{" "}
                                          {shift.capacity}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className={`h-full transition-all duration-500 rounded-full ${
                                            (shift.current_registrations /
                                              shift.capacity) *
                                              100 >=
                                            100
                                              ? "bg-red-500"
                                              : "bg-purple-600"
                                          }`}
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              ((shift.current_registrations ||
                                                0) /
                                                shift.capacity) *
                                                100
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.volunteer_shift_id && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.volunteer_shift_id}
                </p>
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
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experience_level: level,
                    }))
                  }
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all capitalize ${
                    formData.experience_level === level
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* T-Shirt Size */}
          {selectedRole?.has_tshirt && (
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
                        ? "border-purple-500 bg-purple-50 text-purple-700"
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

          {/* Availability Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Availability Notes (Optional)
            </h2>

            <textarea
              name="availability_notes"
              value={formData.availability_notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-colors resize-none"
              placeholder="Any specific availability constraints or preferences..."
            />
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
              className="flex-1 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}
