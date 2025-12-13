"use client";

import { useRouter } from "next/navigation";
import { useEvents } from "../../hooks/useEvents";
import { deleteEvent, publishEvent, unpublishEvent } from "../../lib/events";
import { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  Globe,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EventsListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const [publishing, setPublishing] = useState(null);

  // Fetch events based on active tab
  const filters = {
    ...(activeTab === "draft" && { is_published: 0 }),
    ...(activeTab === "published" && { is_published: 1 }),
    ...(activeTab === "completed" && { status: "completed" }),
  };

  const { events, loading, error, refetch } = useEvents(filters);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setDeleting(id);
    try {
      await deleteEvent(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(null);
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Event Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage your charity events
            </p>
          </div>
          <Link
            href="/ngo/events/create"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Event
          </Link>
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
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "draft" && "You don't have any draft events yet."}
              {activeTab === "published" &&
                "You haven't published any events yet."}
              {activeTab === "completed" && "No completed events."}
              {activeTab === "all" && "Start by creating your first event."}
            </p>
            <Link
              href="/ngo/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDelete}
                onPublish={handlePublish}
                deleting={deleting === event.id}
                publishing={publishing === event.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onDelete, onPublish, deleting, publishing }) {
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
              {!event.is_published && (
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                  Draft
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
              {new Date(event.start_date).toLocaleDateString()} -{" "}
              {new Date(event.end_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Link
            href={`/ngo/events/${event.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>

          <Link
            href={`/ngo/events/${event.id}/preview`}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>

          <button
            onClick={() => onPublish(event.id, event.is_published)}
            disabled={publishing}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              event.is_published
                ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
            }`}
          >
            {publishing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {event.is_published ? "Unpublish" : "Publish"}
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
        </div>
      </div>
    </motion.div>
  );
}
