"use client";

import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export default function CheckInConfirmationModal({
  isOpen,
  onClose,
  registration,
  onConfirm,
  loading,
}) {
  if (!isOpen || !registration) return null;

  const { type, data, event } = registration;
  const user = data.user;
  const alreadyCheckedIn = data.attendance_status === "checked_in";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {alreadyCheckedIn ? "Already Checked In" : "Confirm Check-In"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          {alreadyCheckedIn && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                This {type} has already been checked in
              </span>
            </div>
          )}

          {/* Event Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Event</h3>
            <p className="text-gray-700">{event?.title || event?.name}</p>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              {type === "participant" ? "Participant" : "Volunteer"} Details
            </h3>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            {user?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{user?.phone}</p>
                </div>
              </div>
            )}

            {user?.ic_number && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">IC Number</p>
                  <p className="font-medium text-gray-900">{user?.ic_number}</p>
                </div>
              </div>
            )}

            {/* Type-specific details */}
            {type === "participant" && data.participantCategory && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">
                    {data.participantCategory.name}
                  </p>
                </div>
              </div>
            )}

            {type === "volunteer" && data.volunteerRole && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-900">
                    {data.volunteerRole.name}
                  </p>
                </div>
              </div>
            )}

            {type === "volunteer" && data.volunteerShift && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Shift</p>
                  <p className="font-medium text-gray-900">
                    {data.volunteerShift.start_time} -{" "}
                    {data.volunteerShift.end_time}
                  </p>
                </div>
              </div>
            )}

            {data.bib_number && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">BIB Number</p>
                  <p className="font-medium text-gray-900">{data.bib_number}</p>
                </div>
              </div>
            )}

            {data.tshirt_size && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">T-Shirt Size</p>
                  <p className="font-medium text-gray-900">
                    {data.tshirt_size}
                  </p>
                </div>
              </div>
            )}

            {data.message && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="font-medium text-gray-900">{data.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {!alreadyCheckedIn && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Confirm Check-In
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
