"use client";

import { useRouter } from "next/navigation";
import { useEvents } from "../../hooks/useEvents";
import {
  deleteEvent,
  publishEvent,
  unpublishEvent,
  restoreEvent,
  forceDeleteEvent,
} from "../../lib/events";
import { useState, useEffect } from "react";
import Echo from "../../lib/echo";
import {
  Plus,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  Globe,
  FileText,
  Search,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/app/components/Layout";
import ConfirmModal from "@/app/components/ConfirmModal";
import FormModal from "@/app/components/FormModal";

export default function EventsListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [restoring, setRestoring] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    type: "warning",
    onConfirm: () => {},
  });

  // Unpublish Request State
  const [unpublishModal, setUnpublishModal] = useState({
    isOpen: false,
    eventId: null,
    reason: "",
    loading: false,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch events based on filters
  const filters = {
    page,
    per_page: 6,
    search: debouncedSearch,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...(activeTab === "draft" && { is_published: 0 }),
    ...(activeTab === "published" && { is_published: 1 }),
    ...(activeTab === "completed" && { status: "completed" }),
    ...(activeTab === "trashed" && { trashed: 1 }),
  };

  const { events, loading, error, pagination, refetch } = useEvents(filters);

  // Listen for real-time status updates
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    if (!user.ngo_id) return;

    const channel = Echo.channel(`ngo.${user.ngo_id}`);

    const handleStatusUpdate = (data) => {
      console.log("Event status updated:", data);
      refetch();
    };

    channel.listen(".event.status.updated", handleStatusUpdate);

    return () => {
      channel.stopListening(".event.status.updated", handleStatusUpdate);
    };
  }, [refetch]);

  const handleDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Event",
      message:
        "Are you sure you want to move this event to the Trash? You can restore it later.",
      confirmText: "Delete to Trash",
      type: "danger",
      onConfirm: async () => {
        setDeleting(id);
        try {
          await deleteEvent(id);
          refetch();
        } catch (err) {
          alert(err.response?.data?.message || "Failed to delete event");
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  const handleRestore = async (id) => {
    setRestoring(id);
    try {
      await restoreEvent(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore event");
    } finally {
      setRestoring(null);
    }
  };

  const handleForceDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Permanent Deletion",
      message:
        "This action is PERMANENT and cannot be undone. Are you absolutely sure?",
      confirmText: "Delete Permanently",
      type: "danger",
      onConfirm: async () => {
        setDeleting(id);
        try {
          await forceDeleteEvent(id);
          refetch();
        } catch (err) {
          alert(err.response?.data?.message || "Failed to delete event");
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  const handleUnpublishRequest = async (e) => {
    e.preventDefault();
    if (unpublishModal.reason.length < 10) {
      alert("Please provide a reason with at least 10 characters.");
      return;
    }

    setUnpublishModal((prev) => ({ ...prev, loading: true }));
    try {
      await unpublishEvent(unpublishModal.eventId, {
        reason: unpublishModal.reason,
      });
      alert("Unpublish request submitted successfully.");
      setUnpublishModal({
        isOpen: false,
        eventId: null,
        reason: "",
        loading: false,
      });
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setUnpublishModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePublish = async (id, currentState) => {
    setPublishing(id);
    try {
      if (currentState) {
        await unpublishEvent(id);
      } else {
        await publishEvent(id);
      }
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update publish status");
    } finally {
      setPublishing(null);
    }
  };

  const tabs = [
    { id: "all", label: "All Events", icon: Calendar },
    { id: "draft", label: "Drafts", icon: FileText },
    { id: "published", label: "Published", icon: Globe },
    { id: "completed", label: "Completed", icon: Users },
    { id: "trashed", label: "Trash", icon: Trash2 },
  ];

  const sortOptions = [
    { value: "created_at", label: "Newest First" },
    { value: "start_date", label: "Starting Soon" },
    { value: "title", label: "Alphabetical" },
    { value: "status", label: "Status" },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Event Management
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Empower your cause by managing collective actions
            </p>
          </div>
          <Link
            href="/ngo/events/create"
            className="group flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            Create New Event
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title or description..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all appearance-none font-medium cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <span className="sr-only">Sort by</span>
                  <Edit className="h-5 w-5" />{" "}
                  {/* Using Edit icon as fallback for sort */}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-3 bg-gray-50 border-2 border-gray-50 rounded-2xl hover:bg-white hover:border-emerald-500 text-gray-600 transition-all font-bold"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Tabs */}
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

        {/* Events Grid */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium animate-pulse">
                Syncing with server...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-12 text-center animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-700 font-bold mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-16 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              We couldn't find any events matching your current filters or
              search query.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-emerald-600 font-bold hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  activeTab={activeTab}
                  onDelete={
                    activeTab === "trashed" ? handleForceDelete : handleDelete
                  }
                  onPublish={handlePublish}
                  onRestore={handleRestore}
                  deleting={deleting === event.id}
                  publishing={publishing === event.id}
                  restoring={restoring === event.id}
                  setUnpublishModal={setUnpublishModal}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2.5 rounded-xl border-2 border-gray-100 disabled:opacity-30 hover:border-emerald-500 transition-all"
                >
                  ←
                </button>
                <div className="flex gap-2">
                  {[...Array(pagination.last_page)].map((_, i) => {
                    const p = i + 1;
                    // Show limited page numbers if too many
                    if (
                      p === 1 ||
                      p === pagination.last_page ||
                      (p >= page - 1 && p <= page + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-11 h-11 rounded-xl font-bold transition-all ${
                            page === p
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                              : "border-2 border-gray-100 hover:border-emerald-500 text-gray-600"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === page - 2 || p === page + 2) {
                      return (
                        <span
                          key={p}
                          className="flex items-end pb-2 text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  disabled={page === pagination.last_page}
                  onClick={() => setPage(page + 1)}
                  className="p-2.5 rounded-xl border-2 border-gray-100 disabled:opacity-30 hover:border-emerald-500 transition-all"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}

        {/* Unpublish Request Modal */}
        <FormModal
          isOpen={unpublishModal.isOpen}
          onClose={() =>
            setUnpublishModal({
              isOpen: false,
              eventId: null,
              reason: "",
              loading: false,
            })
          }
          title="Request Unpublish"
          size="md"
        >
          <form onSubmit={handleUnpublishRequest} className="space-y-4">
            <p className="text-sm text-gray-500">
              Published events require admin approval to be unpublished. Please
              provide a valid reason for this request.
            </p>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Reason for Unpublishing
              </label>
              <textarea
                required
                value={unpublishModal.reason}
                onChange={(e) =>
                  setUnpublishModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="Explain why you need to unpublish this event..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setUnpublishModal({
                    isOpen: false,
                    eventId: null,
                    reason: "",
                    loading: false,
                  })
                }
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={unpublishModal.loading}
                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {unpublishModal.loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </FormModal>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          type={confirmConfig.type}
        />
      </div>
    </Layout>
  );
}

function EventCard({
  event,
  activeTab,
  onDelete,
  onPublish,
  onRestore,
  deleting,
  publishing,
  restoring,
  setUnpublishModal,
}) {
  const statusColors = {
    open: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Thumbnail Image */}
      {event.thumbnail ? (
        <img
          src={
            event.thumbnail.includes("charitystride.test")
              ? event.thumbnail.replace(
                  "http://charitystride.test",
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                )
              : event.thumbnail
          }
          alt={event.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback to gradient if image fails to load
            e.target.style.display = "none";
            e.target.nextElementSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className="w-full h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
        style={{ display: event.thumbnail ? "none" : "flex" }}
      >
        <Calendar className="h-16 w-16 text-white opacity-50" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {event.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Module Badges */}
              {event.has_volunteer && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                  👥 Volunteer
                </span>
              )}
              {event.has_donation && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
                  💝 Donation
                </span>
              )}
              {event.has_participant && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                  🏃 Participant
                </span>
              )}

              {/* Status Badge */}
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  statusColors[event.status]
                }`}
              >
                {event.status}
              </span>

              {/* Draft Badge */}
              {!event.is_published && !event.deleted_at && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                  Draft
                </span>
              )}

              {/* Deleted Badge */}
              {event.deleted_at && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                  Trash
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(event.start_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}{" "}
              -{" "}
              {new Date(event.end_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {activeTab === "trashed" ? (
            <>
              <button
                onClick={() => onRestore(event.id)}
                disabled={restoring}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all"
              >
                {restoring ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Restore
              </button>
              <button
                onClick={() => onDelete(event.id)}
                disabled={deleting}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-bold transition-all"
              >
                {deleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </>
          ) : (
            <>
              {!event.is_published && (
                <Link
                  href={`/ngo/events/${event.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              )}

              <Link
                href={`/ngo/events/${event.id}/preview`}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium transition-colors"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Link>

              <button
                onClick={() => {
                  if (event.is_published) {
                    setUnpublishModal({
                      isOpen: true,
                      eventId: event.id,
                      reason: "",
                      loading: false,
                    });
                  } else {
                    onPublish(event.id, event.is_published);
                  }
                }}
                disabled={
                  publishing ||
                  (event.unpublish_requests &&
                    event.unpublish_requests.length > 0)
                }
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  event.is_published
                    ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 disabled:opacity-50"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                }`}
              >
                {publishing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                {event.unpublish_requests && event.unpublish_requests.length > 0
                  ? "Unpublish Pending"
                  : event.is_published
                  ? "Request Unpublish"
                  : "Publish"}
              </button>

              {!event.is_published && (
                <button
                  onClick={() => onDelete(event.id)}
                  disabled={deleting}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  {deleting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
