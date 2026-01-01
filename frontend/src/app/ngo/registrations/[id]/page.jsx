"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/app/components/Layout";
import { useParams, useRouter } from "next/navigation";
import Echo from "../../../lib/echo";
import QRScanner from "../components/QRScanner";
import CheckInConfirmationModal from "../components/CheckInConfirmationModal";
import {
  Users,
  UserCheck,
  Heart,
  Calendar,
  MapPin,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Download,
  ChevronLeft,
  ArrowLeft,
  Check,
  X,
  Wifi,
} from "lucide-react";
import { useEventDetail } from "../../../hooks/useEventDetail";
import { getEventRegistrations } from "../../../lib/events";
import { api } from "../../../lib/api";

const EventRegistrationsPage = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  const [activeTab, setActiveTab] = useState("participants");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);

  // QR Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const { event, loading: eventLoading } = useEventDetail(eventId);
  const [data, setData] = useState({
    participants: [],
    volunteers: [],
    donations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEventRegistrations(eventId);
        console.log("Fetched event registrations:", res);
        if (res.volunteers?.length > 0) {
          console.log(
            "Sample volunteer role:",
            res.volunteers[0].volunteer_role
          );
          console.log(
            "Sample role type:",
            res.volunteers[0].volunteer_role?.role_type
          );
        }
        setData(res);
      } catch (err) {
        console.error("Error fetching registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!eventId || !Echo) return;

    const channel = Echo.channel(`event.${eventId}`);

    channel.listen("RegistrationCreated", (data) => {
      console.log("New registration:", data);
      setIsRealtime(true);

      // Refresh data
      getEventRegistrations(eventId).then((res) => {
        setData(res);
        setToast({
          type: "success",
          message: `New ${data.type} registration received!`,
        });
      });

      setTimeout(() => setIsRealtime(false), 2000);
    });

    return () => {
      if (Echo) {
        channel.stopListening("RegistrationCreated");
        Echo.leave(`event.${eventId}`);
      }
    };
  }, [eventId]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dynamic tabs based on event configuration
  const tabs = [];

  // QR Scanner handlers
  const handleScanSuccess = async (qrCode) => {
    try {
      // Call verifyQR to get registration details (auto-detects event)
      const response = await api.post("/ngo/verify-qr", {
        qr_code: qrCode,
      });

      console.log("Scanned data:", response.data);

      // Store scanned data and show confirmation modal
      setScannedData({
        qr_code: qrCode,
        type: response.data.type,
        registration: response.data.registration,
        event: response.data.event,
      });
      setShowConfirmModal(true);
      setShowScanner(false);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to verify QR code. Please try again.",
      });
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!scannedData) return;

    try {
      await api.post(`/ngo/events/${scannedData.event.id}/check-in`, {
        qr_code: scannedData.qr_code,
        type: scannedData.type,
      });

      setToast({
        type: "success",
        message: `Successfully checked in: ${scannedData.registration.user.name}`,
      });

      setShowConfirmModal(false);
      setScannedData(null);

      // Refresh data
      const res = await getEventRegistrations(eventId);
      setData(res);
    } catch (error) {
      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to check in. Please try again.",
      });
    }
  };

  const handleScanError = (error) => {
    setToast({
      type: "error",
      message: error,
    });
  };

  if (event?.participantConfig || event?.has_participant) {
    tabs.push({
      id: "participants",
      label: "Participants",
      icon: Users,
      count: data.participants.length,
    });
  }

  if (event?.volunteerConfig || event?.has_volunteer) {
    tabs.push({
      id: "volunteers",
      label: "Volunteers",
      icon: UserCheck,
      count: data.volunteers.length,
    });
  }

  if (event?.donationConfig || event?.has_donation) {
    tabs.push({
      id: "donations",
      label: "Donations",
      icon: Heart,
      count: data.donations?.length || 0,
    });
  }

  // Set first available tab as active if current tab not available
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [event]);

  if (loading || eventLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const currentData =
    activeTab === "participants"
      ? data.participants
      : activeTab === "volunteers"
      ? data.volunteers
      : data.donations || [];

  const filteredData = currentData.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const name = item.user?.name || item.name || "";
    const email = item.user?.email || item.email || "";
    return (
      searchQuery === "" ||
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle2,
      },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      approved: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: CheckCircle2,
      },
      paid: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
      delivered: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: CheckCircle2,
      },
    };
    return badges[status] || badges.pending;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Events</span>
        </button>

        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.name}
                </h1>
                {isRealtime && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium animate-pulse">
                    <Wifi className="h-4 w-4" />
                    Live
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {event.start_date
                    ? new Date(event.start_date).toLocaleDateString()
                    : "Date TBA"}
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredData.length} of {currentData.length} {activeTab}
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/ngo/registrations")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {event?.title}
              </h1>
              <p className="text-gray-600">Event Registrations</p>
            </div>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </button>
        </div>
        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} Found
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search"
                  : `No ${activeTab} for this event yet`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activeTab === "participants" &&
                filteredData.map((participant) => {
                  const badge = getStatusBadge(participant.status);
                  const BadgeIcon = badge.icon;

                  return (
                    <div
                      key={participant.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {participant.user?.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${badge.bg} ${badge.text}`}
                            >
                              <BadgeIcon className="h-3 w-3" />
                              {participant.status
                                ?.replace("_", " ")
                                .toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                            <div>
                              <p className="text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">
                                {participant.user?.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Contact</p>
                              <p className="font-medium text-gray-900">
                                {participant.emergency_contact_phone || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Category</p>
                              <p className="font-medium text-gray-900">
                                {
                                  participant.participant_category
                                    ?.category_name
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">BIB Number</p>
                              <p className="font-semibold text-emerald-600">
                                {participant.bib_number || "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {activeTab === "volunteers" &&
                filteredData.map((volunteer) => {
                  const hasAttended =
                    volunteer.attendance_status === "checked_in";
                  const shiftDate = volunteer.volunteer_shift?.shift_date;
                  const startTime = volunteer.volunteer_shift?.start_time;
                  const endTime = volunteer.volunteer_shift?.end_time;

                  // Check if shift is today
                  const isToday =
                    shiftDate &&
                    new Date(shiftDate).toDateString() ===
                      new Date().toDateString();

                  // Format date
                  const formattedDate = shiftDate
                    ? new Date(shiftDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A";

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
                    <div
                      key={volunteer.id}
                      className="p-6 hover:bg-gray-50 transition-colors border-l-4"
                      style={{
                        borderLeftColor: hasAttended ? "#10b981" : "#d1d5db",
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          {/* Name & Attendance Status */}
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {volunteer.user?.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                hasAttended
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {hasAttended ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {hasAttended ? "Attended" : "Not Attended"}
                            </span>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs mb-1">
                                IC Number
                              </p>
                              <p className="font-medium text-gray-900">
                                {volunteer.user?.ic_number || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">Role</p>
                              <p className="font-medium text-gray-900">
                                {volunteer.volunteer_role?.role_type?.name_en === "Other"
                                  ? volunteer.volunteer_role?.custom_role_name || "N/A"
                                  : volunteer.volunteer_role?.role_type?.name_en || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">
                                Shift Date
                              </p>
                              <p
                                className={`font-medium ${
                                  isToday
                                    ? "text-emerald-700 font-bold"
                                    : "text-gray-900"
                                }`}
                              >
                                {formattedDate}
                                {isToday && (
                                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                    Today
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs mb-1">
                                Shift Time
                              </p>
                              <p className="font-medium text-gray-900">
                                {format12Hour(startTime)} -{" "}
                                {format12Hour(endTime)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Details Button */}
                        <button
                          onClick={() => {
                            setScannedData({
                              type: "volunteer",
                              registration: volunteer,
                              event: event
                            });
                            setShowConfirmModal(true);
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <QrCode className="h-4 w-4" />
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              {activeTab === "donations" &&
                filteredData.map((donation) => {
                  const isDonorAnonymous = donation.is_donor_anonymous;

                  return (
                    <div
                      key={donation.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {isDonorAnonymous
                                ? "Anonymous Donor"
                                : donation.user?.name || "Unknown"}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                donation.type === "money"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {donation.type === "money" ? "Money" : "Item"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                            {!isDonorAnonymous && (
                              <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">
                                  {donation.user?.email}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">
                                {donation.type === "money" ? "Amount" : "Item"}
                              </p>
                              <p className="font-medium text-gray-900">
                                {donation.type === "money"
                                  ? `RM ${donation.amount?.toFixed(2)}`
                                  : donation.item_name}
                              </p>
                            </div>
                            {donation.type === "item" && donation.quantity && (
                              <div>
                                <p className="text-gray-500">Quantity</p>
                                <p className="font-medium text-gray-900">
                                  {donation.quantity}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(
                                  donation.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
              <p className="font-medium">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="ml-4 hover:opacity-80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* QR Scanner */}
        {showScanner && (
          <QRScanner
            isOpen={showScanner}
            onClose={() => setShowScanner(false)}
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        )}

        {/* Check-in Confirmation Modal */}
        {showConfirmModal && scannedData && (
          <CheckInConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setScannedData(null);
            }}
            onConfirm={handleConfirmCheckIn}
            registration={{
              type: scannedData.type,
              data: scannedData.registration,
              event: scannedData.event,
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default EventRegistrationsPage;
