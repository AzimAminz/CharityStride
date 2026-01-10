"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Users,
  Globe,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ConfirmModal from "../../components/ConfirmModal";
import StatusModal from "../../components/StatusModal";
import FormModal from "../../components/FormModal";
import { api as axios } from "../../lib/api";
import Echo from "../../lib/echo";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending_approval");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal States
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {},
  });

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    eventId: null,
    reason: "",
    type: null,
  });

  const [feedback, setFeedback] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Take Down Modal State
  const [takeDownModal, setTakeDownModal] = useState({
    isOpen: false,
    eventId: null,
    reason: "",
  });

  // Fetch logic
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Special handling for Unpublish Requests tab
      if (activeTab === "unpublish_requests") {
        const response = await axios.get("/admin/unpublish-requests", {
          params: { page, search },
        });
        setEvents(response.data.data);
        setTotalPages(response.data.last_page);
      } else {
        // Standard Event Listing
        const params = {
          page,
          search,
          status: activeTab === "all" ? undefined : activeTab,
        };
        const response = await axios.get("/admin/events", { params });
        setEvents(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, activeTab, search, refreshTrigger]);

  // Real-time updates
  useEffect(() => {
    const channel = Echo.private("admin-events");

    const handleStatusUpdate = (data) => {
      console.log("Admin: Event status updated, triggering refresh:", data);
      setRefreshTrigger((prev) => prev + 1);
    };

    channel.listen(".event.status.updated", handleStatusUpdate);

    return () => {
      channel.stopListening(".event.status.updated", handleStatusUpdate);
    };
  }, []);

  const handleApprove = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Approve Event",
      message:
        "Are you sure you want to approve this event? It will become visible to the public immediately.",
      confirmText: "Approve & Publish",
      type: "success",
      onConfirm: async () => {
        try {
          await axios.patch(`/admin/events/${id}/approve`);
          fetchEvents();
          setFeedback({
            isOpen: true,
            type: "success",
            title: "Event Approved",
            message: "The event has been successfully published.",
          });
        } catch (error) {
          setFeedback({
            isOpen: true,
            type: "error",
            title: "Approval Failed",
            message: error.response?.data?.message || "Something went wrong.",
          });
        }
      },
    });
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/admin/events/${rejectModal.eventId}/reject`, {
        reason: rejectModal.reason,
      });
      setRejectModal({ isOpen: false, eventId: null, reason: "" });
      fetchEvents();
      setFeedback({
        isOpen: true,
        type: "success",
        title: "Event Rejected",
        message: "The event has been rejected and sent back to draft.",
      });
    } catch (error) {
      setFeedback({
        isOpen: true,
        type: "error",
        title: "Rejection Failed",
        message: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleTakeDown = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/admin/events/${takeDownModal.eventId}/take-down`, {
        reason: takeDownModal.reason,
      });
      setTakeDownModal({ isOpen: false, eventId: null, reason: "" });
      fetchEvents();
      setFeedback({
        isOpen: true,
        type: "success",
        title: "Event Taken Down",
        message: "The event has been successfully taken down (banned).",
      });
    } catch (error) {
      setFeedback({
        isOpen: true,
        type: "error",
        title: "Action Failed",
        message: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleApproveUnpublish = (requestId) => {
    setConfirmConfig({
      isOpen: true,
      title: "Approve Unpublish Request",
      message:
        "Are you sure you want to approve this request? The event will be unpublished and returned to Draft status.",
      confirmText: "Approve & Unpublish",
      type: "warning",
      onConfirm: async () => {
        try {
          await axios.patch(`/admin/unpublish-requests/${requestId}/approve`);
          fetchEvents();
          setFeedback({
            isOpen: true,
            type: "success",
            title: "Request Approved",
            message: "The event has been unpublished.",
          });
        } catch (error) {
          setFeedback({
            isOpen: true,
            type: "error",
            title: "Action Failed",
            message: error.response?.data?.message || "Something went wrong.",
          });
        }
      },
    });
  };

  const handleRejectUnpublish = (requestId) => {
    // Re-use reject modal but slightly different context handling potentially,
    // but for simplicity let's stick to a prompt or similar if possible.
    // Or better, let's use a separate state/modal if needed, OR re-purpose rejectModal but with a different submit handler?
    // Simplest: Use window.prompt or a specific modal. Let's add a specific 'admin_note' modal for this later if needed.
    // For now, let's just use the confirmModal for generic rejection or add a simple prompt fallback?
    // Actually, let's just re-use Reject Modal but add a 'type' field to it to distinguish.
    setRejectModal({
      isOpen: true,
      eventId: requestId, // Using Request ID here
      reason: "",
      type: "unpublish_reject", // Custom flag
    });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    // Distinguish between Event Reject and Unpublish Reject
    if (rejectModal.type === "unpublish_reject") {
      try {
        await axios.patch(
          `/admin/unpublish-requests/${rejectModal.eventId}/reject`,
          {
            admin_note: rejectModal.reason,
          }
        );
        setRejectModal({
          isOpen: false,
          eventId: null,
          reason: "",
          type: null,
        });
        fetchEvents();
        setFeedback({
          isOpen: true,
          type: "success",
          title: "Request Rejected",
          message: "The unpublish request has been rejected.",
        });
      } catch (error) {
        setFeedback({
          isOpen: true,
          type: "error",
          title: "Action Failed",
          message: error.response?.data?.message || "Something went wrong.",
        });
      }
    } else {
      // Normal Event Reject
      handleReject(e);
    }
  };

  const tabs = [
    { id: "pending_approval", label: "Pending Approval", icon: Clock },
    { id: "unpublish_requests", label: "Unpublish Requests", icon: Users },
    { id: "open", label: "Published", icon: Globe },
    { id: "all", label: "All Events", icon: Calendar },
  ];

  const statusColors = {
    pending_approval: "bg-orange-100 text-orange-700",
    open: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-100 text-gray-700",
    completed: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    taken_down: "bg-red-900 text-white",
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Event Approvals
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Review and manage event publish requests from NGOs.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title or NGO name..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-500 font-medium">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((item) => {
              // If in 'unpublish_requests' tab, the item IS the request, containing 'event' relation.
              // Otherwise, item IS the event.
              const isRequest = activeTab === "unpublish_requests";
              const event = isRequest ? item.event : item;
              const requestReason = isRequest ? item.reason : null;

              if (!event) return null; // Safety check

              return (
                <motion.div
                  key={isRequest ? item.id : event.id} // Unique key
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    {event.thumbnail ? (
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <Calendar className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          statusColors[event.status] || "bg-gray-100"
                        }`}
                      >
                        {event.status?.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Unpublish Request Reason (If applicable) */}
                    {isRequest && (
                      <div className="mb-4 p-3 bg-red-50 text-red-900 rounded-lg text-sm border border-red-100">
                        <strong>Request to Unpublish:</strong>
                        <p className="mt-1 italic">"{requestReason}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        {event.ngo?.logo_url ? (
                          <img
                            src={event.ngo.logo_url}
                            alt={event.ngo.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold">
                            {event.ngo?.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {event.ngo?.name}
                        </h4>
                        <p className="text-xs text-gray-500">Organizer</p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                      <a
                        href={`/ngo/events/${event.id}/preview`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </a>

                      {/* Actions for Pending Approval */}
                      {event.status === "pending_approval" && !isRequest && (
                        <>
                          <button
                            onClick={() =>
                              setRejectModal({
                                isOpen: true,
                                eventId: event.id,
                                reason: "",
                                type: "normal",
                              })
                            }
                            className="flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="flex items-center justify-center p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {/* Actions for Published/Open Events */}
                      {event.status === "open" && !isRequest && (
                        <button
                          onClick={() =>
                            setTakeDownModal({
                              isOpen: true,
                              eventId: event.id,
                              reason: "",
                            })
                          }
                          className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                          Take Down
                        </button>
                      )}

                      {/* Actions for Unpublish Requests */}
                      {isRequest && (
                        <>
                          <button
                            onClick={() => handleRejectUnpublish(item.id)}
                            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-bold text-xs"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => handleApproveUnpublish(item.id)}
                            className="flex items-center justify-center px-3 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 font-bold text-xs"
                          >
                            Approve & Unpublish
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          {...confirmConfig}
        />

        <FormModal
          isOpen={rejectModal.isOpen}
          onClose={() =>
            setRejectModal({
              isOpen: false,
              eventId: null,
              reason: "",
              type: null,
            })
          }
          title={
            rejectModal.type === "unpublish_reject"
              ? "Reject Unpublish Request"
              : "Reject Event"
          }
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              {rejectModal.type === "unpublish_reject"
                ? "Please provide a reason for rejecting this unpublish request. The event will remain published."
                : "Please provide a reason for rejecting this event. This will be visible to the NGO."}
            </p>
            <textarea
              required
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none transition-all resize-none"
              rows={4}
              placeholder="Reason..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setRejectModal({
                    isOpen: false,
                    eventId: null,
                    reason: "",
                    type: null,
                  })
                }
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </FormModal>

        {/* Take Down Modal */}
        <FormModal
          isOpen={takeDownModal.isOpen}
          onClose={() =>
            setTakeDownModal({ isOpen: false, eventId: null, reason: "" })
          }
          title="Take Down Event (Ban)"
        >
          <form onSubmit={handleTakeDown} className="space-y-4">
            <div className="p-3 bg-red-50 text-red-900 rounded-xl border border-red-100 text-sm">
              <strong>Warning:</strong> This event will be immediately hidden
              from the public and marked as "Taken Down". Tickets/Registrations
              may be affected.
            </div>
            <p className="text-sm text-gray-500">
              Please provide a valid reason for taking down this active event.
            </p>
            <textarea
              required
              value={takeDownModal.reason}
              onChange={(e) =>
                setTakeDownModal({ ...takeDownModal, reason: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none transition-all resize-none"
              rows={4}
              placeholder="Reason for take down..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setTakeDownModal({ isOpen: false, eventId: null, reason: "" })
                }
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-900 text-white font-bold rounded-xl hover:bg-red-950 transition-colors"
              >
                Take Down Event
              </button>
            </div>
          </form>
        </FormModal>

        <StatusModal
          isOpen={feedback.isOpen}
          onClose={() => setFeedback({ ...feedback, isOpen: false })}
          title={feedback.title}
          message={feedback.message}
          type={feedback.type}
        />
      </div>
    </>
  );
}
