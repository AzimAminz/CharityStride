"use client";

import { useEventDetail } from "../../../../hooks/useEventDetail";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Calendar, Globe, Edit } from "lucide-react";
import Link from "next/link";

/**
 * Event Preview Page
 * Shows how the published event will look to users
 */
export default function EventPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{error || "Event not found"}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 py-3 px-4 text-center font-medium">
        <span className="mr-2">👁️</span>
        Preview Mode - This is how your event will appear to users
        <Link
          href={`/ngo/events/${id}/edit`}
          className="ml-4 underline hover:no-underline"
        >
          Back to Edit
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {event.thumbnail ? (
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-96 object-cover"
          />
        ) : (
          <div className="w-full h-96 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Calendar className="h-32 w-32 text-white opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="max-w-6xl mx-auto w-full px-6 py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Module Badges */}
              {event.has_volunteer && (
                <span className="px-3 py-1 bg-blue-500/90 text-white rounded-full text-sm font-medium">
                  👥 Volunteer
                </span>
              )}
              {event.has_donation && (
                <span className="px-3 py-1 bg-orange-500/90 text-white rounded-full text-sm font-medium">
                  💝 Donation
                </span>
              )}
              {event.has_participant && (
                <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-sm font-medium">
                  🏃 Participant
                </span>
              )}
              <span className="px-3 py-1 bg-emerald-500/90 text-white rounded-full text-sm font-medium">
                {event.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>

              {/* Event Sections */}
              {event.sections && event.sections.length > 0 && (
                <div className="mt-8 space-y-6">
                  {event.sections.map((section) => (
                    <div key={section.id}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-gray-700">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Event Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start_date).toLocaleDateString()} -{" "}
                      {new Date(event.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Available Modules */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Available Options
                  </p>
                  <div className="space-y-2">
                    {event.has_volunteer && (
                      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded">
                        <span>👥</span> Volunteer Opportunities
                      </div>
                    )}
                    {event.has_donation && (
                      <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded">
                        <span>💝</span> Donation Accepted
                      </div>
                    )}
                    {event.has_participant && (
                      <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded">
                        <span>🏃</span> Participant Registration
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Register Button */}
            <button
              disabled
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold opacity-50 cursor-not-allowed"
            >
              Register Now (Preview Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
