"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Echo from "../../../lib/echo";
import Layout from "@/app/components/Layout";
import {
  Users,
  Heart,
  UserPlus,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ClipboardList,
  Shirt,
  MoreVertical,
  CheckIcon,
  XIcon,
  RefreshCcw,
  BadgeDollarSign,
  QrCode,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { getEventRegistrations } from "@/app/lib/events";
import Loading from "@/app/loading";
import QRScanner from "../components/QRScanner";
import CheckInConfirmationModal from "../components/CheckInConfirmationModal";
import { api, getStorageUrl } from "@/app/lib/api";

export default function EventRegistrationsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("participants");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getEventRegistrations(id);
      setData(res);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // WebSocket listener for new registrations
  useEffect(() => {
    if (!id || !Echo) return;

    // Get user data from localStorage to get ngo_id
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    const ngoId = user?.ngo_id;
    if (!ngoId) return;

    const channel = Echo.channel(`ngo.${ngoId}`);

    channel.listen("registration.created", (data) => {
      // Only refresh if the registration belongs to THIS event
      if (data.event_id === parseInt(id)) {
        console.log(
          "New registration for this event received via WebSocket:",
          data
        );

        // Option 1: Full refresh to get everything consistent
        fetchData();

        // Option 2: Show notification
        setToast({
          type: "success",
          message: `New ${data.registration_type} registration received!`,
        });
      }
    });

    return () => {
      if (Echo && ngoId) {
        channel.stopListening("registration.created");
        // We don't leave the channel here if other components might be using it,
        // but since this is a page component, it's generally safe.
      }
    };
  }, [id]);

  // Set initial active tab based on enabled modules
  useEffect(() => {
    if (data?.event) {
      if (data.event.has_participant) {
        setActiveTab("participants");
      } else if (data.event.has_volunteer) {
        setActiveTab("volunteers");
      } else if (data.event.has_donation) {
        setActiveTab("donations");
      }
    }
  }, [data]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleScanSuccess = async (qrCode) => {
    try {
      const response = await api.post("/ngo/verify-qr", {
        qr_code: qrCode,
      });

      if (response.data.event.id !== parseInt(id)) {
        setToast({
          type: "error",
          message: "This registration is for a different event.",
        });
        return;
      }

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
        message: error.response?.data?.message || "Verification failed.",
      });
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!scannedData) return;
    setIsCheckingIn(true);
    try {
      await api.post(`/ngo/events/${id}/check-in`, {
        qr_code: scannedData.qr_code,
        type: scannedData.type,
      });
      setToast({ type: "success", message: "Checked in successfully!" });
      setShowConfirmModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      setToast({
        type: "error",
        message: error.response?.data?.message || "Check-in failed.",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleConfirmCheckOut = async () => {
    if (!scannedData) return;
    setIsCheckingOut(true);
    try {
      const response = await api.post(`/ngo/events/${id}/check-out`, {
        qr_code: scannedData.qr_code,
      });
      setToast({
        type: "success",
        message: response.data.message || "Checked out successfully!",
      });
      setShowConfirmModal(false);
      setScannedData(null);
      fetchData(); // Refresh data
    } catch (error) {
      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to check out. Please try again.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];

    let currentList = [];
    if (activeTab === "participants") currentList = data.participants;
    else if (activeTab === "volunteers") currentList = data.volunteers;
    else currentList = data.donations;

    // Filter by name/email/IC
    let filtered = currentList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const name = item.user?.name?.toLowerCase() || "";
      const email = item.user?.email?.toLowerCase() || "";
      const ic = item.user?.ic_number?.toLowerCase() || "";

      return name.includes(q) || email.includes(q) || ic.includes(q);
    });

    // Sort by attendance (Checked-in first)
    if (activeTab !== "donations") {
      filtered.sort((a, b) => {
        if (
          a.attendance_status === "checked_in" &&
          b.attendance_status !== "checked_in"
        )
          return -1;
        if (
          a.attendance_status !== "checked_in" &&
          b.attendance_status === "checked_in"
        )
          return 1;
        return 0;
      });
    }

    return filtered;
  }, [data, activeTab, searchQuery, statusFilter]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const format12Hour = (dateStr) => {
    if (!dateStr) return "(not complete)";

    // If it's just a time string (HH:mm:ss or HH:mm), prepend a dummy date
    // This handles shift times (start_time/end_time) which are usually just times
    let date;
    if (dateStr.length <= 8 && dateStr.includes(":")) {
      date = new Date(`2000-01-01T${dateStr}`);
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return "(not complete)";

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportToCSV = () => {
    // Export ALL filtered data, not just current page
    if (!filteredData.length) return;

    let headers = [];
    let rows = [];

    if (activeTab === "participants") {
      headers = [
        "Name",
        "Email",
        "IC Number",
        "Category",
        "BIB",
        "T-Shirt",
        "Date",
      ];
      rows = filteredData.map((p) => [
        p.user?.name,
        p.user?.email,
        p.user?.ic_number || "N/A",
        p.participant_category?.name_en || "N/A",
        p.bib_number || "N/A",
        p.tshirt_size || "(no shirt)",
        new Date(p.created_at).toLocaleDateString(),
      ]);
    } else if (activeTab === "volunteers") {
      headers = [
        "Name",
        "Email",
        "IC Number",
        "Role",
        "Shift",
        "T-Shirt",
        "Date",
      ];
      rows = filteredData.map((v) => [
        v.user?.name,
        v.user?.email,
        v.user?.ic_number || "N/A",
        v.volunteer_role?.custom_role_name ||
          v.volunteer_role?.role_type?.name_en ||
          "N/A",
        v.volunteer_shift?.shift_date
          ? `${v.volunteer_shift.shift_date} (${format12Hour(
              v.volunteer_shift.start_time
            )} - ${format12Hour(v.volunteer_shift.end_time)})`
          : "N/A",
        v.tshirt_size || "(no shirt)",
        new Date(v.created_at).toLocaleDateString(),
      ]);
    } else {
      headers = ["Name", "Email", "Amount (RM)", "Payment Status", "Date"];
      rows = filteredData.map((d) => [
        d.user?.name || "Anonymous",
        d.user?.email || "N/A",
        (d.amount_paid / 100).toFixed(2),
        d.payments?.[0]?.payment_status || "N/A",
        new Date(d.created_at).toLocaleDateString(),
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${data.event.title.replace(/\s+/g, "_")}_${activeTab}_registrations.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loading />;
  if (!data)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">
          Event not found or unauthorized.
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="group flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Registrations
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {data.event.title}
            </h1>
            <p className="text-gray-500 mt-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Registration details and management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={!filteredData.length}
              className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5 mr-2 text-emerald-600" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Registrations",
              value: data.stats.total_registrations,
              icon: ClipboardList,
              color: "blue",
            },
            {
              label: "Participants",
              value: data.stats.participants_count,
              icon: Users,
              color: "emerald",
            },
            {
              label: "Volunteers",
              value: data.stats.volunteers_count,
              icon: UserPlus,
              color: "purple",
            },
            {
              label: "Total Revenue",
              value: `RM ${data.stats.total_revenue}`,
              icon: BadgeDollarSign,
              color: "amber",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div
                className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all`}
              >
                <stat.icon className={`h-16 w-16 text-${stat.color}-600`} />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          {/* Tabs & Filters */}
          <div className="border-b border-gray-100">
            <div className="px-6 pt-4 flex flex-col gap-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100">
                {[
                  {
                    id: "participants",
                    label: "Participants",
                    icon: Users,
                    count: data.stats.participants_count,
                    enabled: data.event.has_participant,
                  },
                  {
                    id: "volunteers",
                    label: "Volunteers",
                    icon: UserPlus,
                    count: data.stats.volunteers_count,
                    enabled: data.event.has_volunteer,
                  },
                  {
                    id: "donations",
                    label: "Donations",
                    icon: Heart,
                    count: data.stats.donations_count,
                    enabled: data.event.has_donation,
                  },
                ]
                  .filter((tab) => tab.enabled)
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setStatusFilter("all");
                        setCurrentPage(1);
                      }}
                      className={`flex items-center px-4 py-4 text-sm font-semibold transition-all border-b-2 relative ${
                        activeTab === tab.id
                          ? "text-emerald-600 border-emerald-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200"
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                          activeTab === tab.id
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto">
            {filteredData.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">
                      {activeTab === "donations" ? "Donor" : "Applicant"} Info
                    </th>
                    {activeTab === "participants" && (
                      <th className="px-6 py-4">
                        {filteredData.some(
                          (p) => p.participant_category?.has_bib
                        )
                          ? "Category & BIB"
                          : "Category"}
                      </th>
                    )}
                    {activeTab === "volunteers" && (
                      <th className="px-6 py-4">Role & Shift</th>
                    )}
                    {activeTab === "donations" && (
                      <th className="px-6 py-4">Amount</th>
                    )}
                    {activeTab !== "donations" && (
                      <>
                        <th className="px-6 py-4">T-Shirt</th>
                        <th className="px-6 py-4">Attendance</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {item.user?.photo ? (
                            <img
                              src={getStorageUrl(item.user.photo)}
                              alt={item.user.name}
                              className="h-10 w-10 rounded-full object-cover mr-3 shadow-sm border border-gray-100"
                            />
                          ) : (
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg mr-3 shadow-inner ${
                                activeTab === "donations"
                                  ? "bg-purple-100 text-purple-600"
                                  : activeTab === "volunteers"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {item.user?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                              {item.user?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500 mb-0.5">
                              {item.user?.email || "No email"}
                            </p>
                            {activeTab !== "donations" && (
                              <p className="text-[10px] text-gray-400 font-mono">
                                IC: {item.user?.ic_number || "N/A"}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {activeTab === "participants" && (
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {item.participant_category?.category_name}
                            </p>
                            {item.participant_category?.has_bib &&
                              item.bib_number && (
                                <p className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">
                                  BIB: {item.bib_number}
                                </p>
                              )}
                          </div>
                        </td>
                      )}

                      {activeTab === "volunteers" && (
                        <td className="px-6 py-4">
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {item.volunteer_role?.custom_role_name ||
                                item.volunteer_role?.role_type?.name_en}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <p className="text-[10px] text-gray-500">
                                {format12Hour(item.volunteer_shift?.start_time)}{" "}
                                - {format12Hour(item.volunteer_shift?.end_time)}
                                {item.total_hours > 0 && (
                                  <span className="ml-2 font-bold text-emerald-600">
                                    ({item.total_hours}h)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      {activeTab === "donations" && (
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-emerald-600">
                              RM {(item.amount_paid / 100).toFixed(2)}
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${
                                item.payments?.[0]?.payment_status === "paid"
                                  ? "text-green-500"
                                  : "text-amber-500"
                              }`}
                            >
                              {item.payments?.[0]?.payment_status?.toUpperCase() ||
                                "PENDING"}
                            </p>
                          </div>
                        </td>
                      )}

                      {activeTab !== "donations" && (
                        <>
                          <td className="px-6 py-4 text-xs">
                            <div className="flex flex-col gap-2 font-medium">
                              {item.tshirt_size ? (
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <Shirt className="h-3 w-3" />
                                  <span>{item.tshirt_size}</span>
                                  {item.tshirt_collected ? (
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-amber-500" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">
                                  (no shirt)
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-bold w-fit ${
                                  item.attendance_status === "checked_in" ||
                                  item.attendance_status === "completed" ||
                                  item.attendance_status === "checked_out"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {item.attendance_status === "completed" ||
                                item.attendance_status === "checked_out"
                                  ? `Completed ${
                                      item.total_hours &&
                                      parseFloat(item.total_hours) > 0
                                        ? `(${item.total_hours}h)`
                                        : ""
                                    }`
                                  : item.attendance_status === "checked_in"
                                  ? "Present"
                                  : "Absent"}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                <span className="font-bold text-gray-500">
                                  IN:
                                </span>
                                <span>{format12Hour(item.check_in_time)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                <span className="font-bold text-gray-500">
                                  OUT:
                                </span>
                                <span>{format12Hour(item.check_out_time)}</span>
                              </div>
                            </div>
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setScannedData({
                              qr_code: item.qr_code,
                              type:
                                activeTab === "participants"
                                  ? "participant"
                                  : activeTab === "volunteers"
                                  ? "volunteer"
                                  : "donation",
                              registration: item,
                              event: data.event,
                              isViewOnly: true,
                            });
                            setShowConfirmModal(true);
                          }}
                          className="p-2 hover:bg-emerald-50 rounded-full text-emerald-600 group-hover:bg-emerald-100 transition-all"
                          title="View & Check-in"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-500 max-w-xs mt-1">
                  We couldn't find any {activeTab} matching your current
                  filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-bold transition-all ${
                            currentPage === page
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Page <span className="text-gray-900">{currentPage}</span> of{" "}
                <span className="text-gray-900">{totalPages}</span>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <strong>
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </strong>{" "}
              of <strong>{filteredData.length}</strong> records
            </p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <RefreshCcw className="h-3 w-3 animate-spin-slow" />
              Auto-sync enabled
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scan Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-8 right-8 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-110 z-30"
      >
        <QrCode className="h-6 w-6" />
        <span className="font-bold">Scan QR</span>
      </button>

      {/* Modals & Toasts */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={(err) => setToast({ type: "error", message: err })}
      />

      <CheckInConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setScannedData(null);
        }}
        data={scannedData?.registration}
        type={scannedData?.type}
        event={scannedData?.event}
        onConfirm={handleConfirmCheckIn}
        onConfirmCheckOut={handleConfirmCheckOut}
        isConfirming={isCheckingIn}
        isCheckingOut={isCheckingOut}
        isViewOnly={scannedData?.isViewOnly}
      />

      {toast && (
        <div className="fixed top-8 right-8 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-white border border-gray-100 animate-slide-up">
          {toast.type === "success" ? (
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <p className="font-bold text-gray-900">{toast.message}</p>
        </div>
      )}

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
}
