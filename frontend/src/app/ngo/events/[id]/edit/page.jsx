"use client";

import { useRouter, useParams } from "next/navigation";
import { useEventDetail } from "../../../../hooks/useEventDetail";
import {
  updateEvent,
  publishEvent,
  unpublishEvent,
} from "../../../../lib/events";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Globe,
  GlobeLock,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import EventThumbnailUpload from "../../../../components/EventThumbnailUpload";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading: loadingEvent, error: loadError } = useEventDetail(id);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    has_volunteer: false,
    has_donation: false,
    has_participant: false,
    thumbnail: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  // Load event data into form
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        start_date: event.start_date || "",
        end_date: event.end_date || "",
        has_volunteer: event.has_volunteer || false,
        has_donation: event.has_donation || false,
        has_participant: event.has_participant || false,
        thumbnail: event.thumbnail || null,
      });
    }
  }, [event]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateEvent(id, formData);
      router.push("/ngo/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!event) return;

    setPublishing(true);
    try {
      if (event.is_published) {
        await unpublishEvent(id);
      } else {
        await publishEvent(id);
      }
      router.push("/ngo/events");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update publish status");
    } finally {
      setPublishing(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{loadError}</p>
          <Link
            href="/ngo/events"
            className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/ngo/events"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="text-gray-600 mt-1">Update your event details</p>
            </div>
            {event && (
              <div>
                {event.is_published ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                    <Globe className="h-4 w-4" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
                    <FileText className="h-4 w-4" />
                    Draft
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {event?.is_published && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Warning:</strong> This event is published. Changes will be
              visible to users immediately.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Thumbnail Upload Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <EventThumbnailUpload
              currentThumbnail={formData.thumbnail}
              onThumbnailChange={(url) => handleChange("thumbnail", url)}
            />
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Module Enablers Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Modules
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Note: Detailed module configuration is done during event creation.
              You can only enable/disable modules here.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="has_volunteer"
                  checked={formData.has_volunteer}
                  onChange={(e) =>
                    handleChange("has_volunteer", e.target.checked)
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="has_volunteer"
                  className="text-sm font-medium text-gray-700"
                >
                  👥 Volunteer Module
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <input
                  type="checkbox"
                  id="has_donation"
                  checked={formData.has_donation}
                  onChange={(e) =>
                    handleChange("has_donation", e.target.checked)
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="has_donation"
                  className="text-sm font-medium text-gray-700"
                >
                  💝 Donation Module
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <input
                  type="checkbox"
                  id="has_participant"
                  checked={formData.has_participant}
                  onChange={(e) =>
                    handleChange("has_participant", e.target.checked)
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="has_participant"
                  className="text-sm font-medium text-gray-700"
                >
                  🏃 Participant Module
                </label>
              </div>
            </div>
          </div>

          {/* Event Schedule Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Schedule
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || publishing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePublishToggle}
              disabled={loading || publishing}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                event?.is_published
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {publishing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {event?.is_published ? "Unpublishing..." : "Publishing..."}
                </>
              ) : (
                <>
                  {event?.is_published ? (
                    <>
                      <GlobeLock className="h-5 w-5" /> Unpublish Event
                    </>
                  ) : (
                    <>
                      <Globe className="h-5 w-5" /> Publish Event
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
