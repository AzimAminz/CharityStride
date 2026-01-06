"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Building2,
  Clock,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusModal from "@/app/components/StatusModal";

const AdminEventsPage = () => {
  const [activeTab, setActiveTab] = useState("all"); // "all", "requests"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalType, setModalType] = useState(null); // "success", "error"
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [confirmingAction, setConfirmingAction] = useState(null); // { type: 'takedown'|'approve'|'reject', id: string, note?: string }
  const [adminNote, setAdminNote] = useState("");
  const [takeDownReason, setTakeDownReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      let url = "";
      if (activeTab === "all") {
        url = `${baseUrl}/api/admin/events?search=${search}&page=${page}&status=${
          statusFilter === "all" ? "" : statusFilter
        }`;
      } else {
        url = `${baseUrl}/api/admin/events/unpublish-requests?page=${page}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }
      const result = await response.json();

      if (activeTab === "all") {
        setEvents(result.data);
      } else {
        setRequests(result.data);
      }
      setMeta(result.meta);
    } catch (err) {
      console.error(err);
      setModalType("error");
      setModalTitle("Fetch Error");
      setModalMessage("Could not retrieve events data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [activeTab, search, page, statusFilter]);

  const handleAdminAction = async () => {
    if (!confirmingAction) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      let url = "";
      let method = "PATCH";
      let body = {};

      if (confirmingAction.type === "takedown") {
        url = `${baseUrl}/api/admin/events/${confirmingAction.id}/unpublish`;
        body = {
          reason: takeDownReason,
        };
      } else {
        url = `${baseUrl}/api/admin/unpublish-requests/${confirmingAction.id}/process`;
        body = {
          status: confirmingAction.type === "approve" ? "approved" : "rejected",
          admin_note: adminNote,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Action failed");

      setModalType("success");
      setModalTitle("Success");
      setModalMessage(
        confirmingAction.type === "takedown"
          ? "Event has been successfully taken down."
          : `Request has been ${
              confirmingAction.type === "approve" ? "approved" : "rejected"
            }.`
      );

      setConfirmingAction(null);
      setAdminNote("");
      setTakeDownReason("");
      fetchData();
    } catch (err) {
      setModalType("error");
      setModalTitle("Action Failed");
      setModalMessage("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Event <span className="text-emerald-600">Management</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Oversee all platform activities and unpublish requests
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <TabButton
            active={activeTab === "all"}
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
            icon={<CalendarDays className="h-4 w-4" />}
            label="All Events"
          />
          <TabButton
            active={activeTab === "requests"}
            onClick={() => {
              setActiveTab("requests");
              setPage(1);
            }}
            icon={<Clock className="h-4 w-4" />}
            label="Unpublish Requests"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by title or NGO name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
            />
          </div>

          {activeTab === "all" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
              {["all", "published", "taken_down"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    statusFilter === s
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-900"
                  }`}
                >
                  {s === "taken_down" ? "TAKEN DOWN" : s.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingSkeleton key="loading" />
            ) : activeTab === "all" ? (
              <EventsList
                events={events}
                onTakeDown={(e) =>
                  setConfirmingAction({
                    type: "takedown",
                    id: e.id,
                    title: e.title,
                  })
                }
              />
            ) : (
              <RequestsList
                requests={requests}
                onProcess={(r, type) =>
                  setConfirmingAction({ type, id: r.id, title: r.event?.title })
                }
              />
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <span className="text-sm font-bold text-gray-600">
              Page {page} of {meta.last_page}
            </span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage(page + 1)}
              className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {confirmingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full space-y-6"
          >
            <div className="flex items-center gap-4 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black">
                {confirmingAction.type === "takedown"
                  ? "Take Down Event"
                  : "Process Request"}
              </h3>
            </div>

            <p className="text-gray-600 font-medium">
              Are you sure you want to{" "}
              {confirmingAction.type === "takedown"
                ? "take down"
                : confirmingAction.type}{" "}
              the event{" "}
              <span className="text-gray-900 font-bold">
                "{confirmingAction.title}"
              </span>
              ?
            </p>

            {confirmingAction.type === "takedown" && (
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Reason for Take-Down (Required)
                </label>
                <textarea
                  value={takeDownReason}
                  onChange={(e) => setTakeDownReason(e.target.value)}
                  placeholder="Explain why this event is being taken down..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium h-32 resize-none"
                  required
                />
              </div>
            )}

            {(confirmingAction.type === "approve" ||
              confirmingAction.type === "reject") && (
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Admin Note to NGO
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note explaining your decision..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gray-200 outline-none text-sm font-medium h-24 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingAction(null)}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminAction}
                className={`flex-1 py-4 ${
                  confirmingAction.type === "reject"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-gray-900 hover:bg-black"
                } text-white font-black rounded-2xl transition-all shadow-lg`}
              >
                Confirm {confirmingAction.type}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Feedback Modals */}
      <StatusModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType || "success"}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

// Sub-components for better organization
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
      active
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
        : "text-gray-500 hover:bg-gray-50"
    }`}
  >
    {icon}
    {label}
  </button>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
    ))}
  </div>
);

const EventsList = ({ events, onTakeDown }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    {events.length > 0 ? (
      events.map((event) => (
        <div
          key={event.id}
          className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-emerald-600 border border-gray-100">
              {event.title[0]}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                {event.title}
              </h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {event.ngo?.name}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    event.is_published
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {event.is_published ? "PUBLISHED" : "UNPUBLISHED"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`/events/${event.id}`}
              target="_blank"
              className="flex-1 sm:flex-none p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="sm:hidden text-xs font-bold">View</span>
            </a>
            {event.is_published && (
              <button
                onClick={() => onTakeDown(event)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-xs font-black shadow-sm"
              >
                TAKE DOWN
              </button>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="h-full flex flex-col items-center justify-center p-20 text-gray-400 space-y-4">
        <CalendarDays className="h-16 w-16 opacity-10" />
        <p className="font-bold">No events found matching your criteria.</p>
      </div>
    )}
  </motion.div>
);

const RequestsList = ({ requests, onProcess }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    {requests.length > 0 ? (
      requests.map((req) => (
        <div
          key={req.id}
          className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-lg transition-all"
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-gray-900 group-hover:text-rose-600">
                  {req.event?.title}
                </h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
                  By {req.event?.ngo?.name}
                </p>
                <div className="mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                    NGO Reason
                  </p>
                  <p className="text-sm font-medium text-gray-700 italic">
                    "{req.reason}"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 justify-end">
              <button
                onClick={() => onProcess(req, "approve")}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-xs font-black flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                APPROVE
              </button>
              <button
                onClick={() => onProcess(req, "reject")}
                className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-xs font-black flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                REJECT
              </button>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="h-full flex flex-col items-center justify-center p-20 text-gray-400 space-y-4">
        <CheckCircle className="h-16 w-16 opacity-10 text-emerald-500" />
        <p className="font-bold">Clear! No pending unpublish requests.</p>
      </div>
    )}
  </motion.div>
);

export default AdminEventsPage;
