"use client";

import { useState } from "react";
import { X, User, CheckCircle, Loader2, IdCard, FileText } from "lucide-react";
import { getStorageUrl } from "@/app/lib/api";

export default function CheckInConfirmationModal({
  isOpen,
  onClose,
  data,
  type,
  event,
  onConfirm,
  isConfirming = false,
  isViewOnly = false,
}) {
  const [activeTab, setActiveTab] = useState("personal");

  if (!isOpen || !data) return null;

  const alreadyCheckedIn = data.attendance_status === "checked_in";

  // Format time to 12-hour
  const format12Hour = (time24) => {
    if (!time24) return "N/A";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {type === "donation"
              ? "Donation Details"
              : alreadyCheckedIn
              ? "Already Checked In"
              : "Confirm Check-In"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Status Badge */}
        {alreadyCheckedIn && type !== "donation" && (
          <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg flex-shrink-0">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              This {type} has already been checked in
            </span>
          </div>
        )}

        {/* Event Info */}
        <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-emerald-700 text-xs font-medium mb-1">Event</p>
              <p className="font-semibold text-emerald-900">
                {event?.title || event?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-emerald-700 text-xs font-medium mb-1">Type</p>
              <p className="font-semibold text-emerald-900 capitalize">
                {type}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 mt-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === "personal"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              Personal Info
            </div>
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === "details"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Registration Details
            </div>
          </button>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {data.user?.photo ? (
                    <img
                      src={getStorageUrl(data.user.photo)}
                      alt="Profile"
                      className="flex-shrink-0 w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {data.user?.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{data.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                      Phone Number
                    </p>
                    <p className="font-medium text-gray-900">
                      {data.user?.phone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
                      IC Number
                    </p>
                    <p className="font-medium text-gray-900">
                      {data.user?.ic_number || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Details Tab */}
            {activeTab === "details" && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Participant specific */}
                {type === "participant" && data.participant_category && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Category</p>
                    <p className="font-medium text-gray-900">
                      {data.participant_category.category_name}
                    </p>
                  </div>
                )}

                {data.participant_category?.has_bib && data.bib_number && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">BIB Number</p>
                    <p className="font-medium text-gray-900">
                      {data.bib_number}
                    </p>
                  </div>
                )}
                {type === "participant" && data.emergency_contact_name && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Emergency Contact Name
                    </p>
                    <p className="font-medium text-gray-900">
                      {data.emergency_contact_name}
                    </p>
                  </div>
                )}
                {type === "participant" && data.emergency_contact_phone && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Emergency Contact Phone
                    </p>
                    <p className="font-medium text-gray-900">
                      {data.emergency_contact_phone}
                    </p>
                  </div>
                )}

                {/* Volunteer specific */}
                {type === "volunteer" && data.volunteer_role && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Role</p>
                    <p className="font-medium text-gray-900">
                      {data.volunteer_role.custom_role_name ||
                        data.volunteer_role.role_type?.name_en ||
                        "N/A"}
                    </p>
                  </div>
                )}
                {type === "volunteer" && data.volunteer_shift && (
                  <>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Shift Date</p>
                      <p className="font-medium text-gray-900">
                        {data.volunteer_shift.shift_date
                          ? new Date(
                              data.volunteer_shift.shift_date
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Shift Time</p>
                      <p className="font-medium text-gray-900">
                        {format12Hour(data.volunteer_shift.start_time)} -{" "}
                        {format12Hour(data.volunteer_shift.end_time)}
                      </p>
                    </div>
                  </>
                )}
                {type === "volunteer" && data.experience_level && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">
                      Experience Level
                    </p>
                    <p className="font-medium text-gray-900 capitalize">
                      {data.experience_level}
                    </p>
                  </div>
                )}
                {type === "volunteer" && data.availability_notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs mb-1">
                      Availability Notes
                    </p>
                    <p className="font-medium text-gray-900 leading-relaxed">
                      {data.availability_notes}
                    </p>
                  </div>
                )}
                {type === "donation" && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs mb-1">Amount Donated</p>
                    <p className="text-xl font-bold text-emerald-600">
                      RM {(data.amount_paid / 100).toFixed(2)}
                    </p>
                  </div>
                )}
                {type !== "donation" && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">T-Shirt Size</p>
                    <p
                      className={`font-medium ${
                        data.tshirt_size
                          ? "text-gray-900"
                          : "text-gray-400 italic"
                      }`}
                    >
                      {data.tshirt_size || "(no shirt)"}
                    </p>
                  </div>
                )}

                {data.message && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs mb-1">
                      Request/Message
                    </p>
                    <p className="font-medium text-gray-900">{data.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors ${
              isViewOnly ? "bg-gray-100" : ""
            }`}
          >
            {isViewOnly ? "Close" : "Cancel"}
          </button>
          {!alreadyCheckedIn && !isViewOnly && (
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking in...
                </>
              ) : (
                "Confirm Check-in"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
