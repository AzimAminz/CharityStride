"use client";

import { useRouter, useParams } from "next/navigation";
import { useEventDetail } from "../../../../hooks/useEventDetail";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import EventSectionsManager from "../../../../components/EventSectionsManager";
import RunCategoriesManager from "../../../../components/RunCategoriesManager";
import VolunteerShiftsManager from "../../../../components/VolunteerShiftsManager";
import FoodDonationForm from "../../../../components/FoodDonationForm";
import EventTshirtsManager from "../../../../components/EventTshirtsManager";

/**
 * Event Details Management Page
 * Manage sections, categories, shifts, and food donation based on event type
 */
export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { event, loading, error, refetch } = useEventDetail(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/ngo/events/${id}/edit`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-600 mt-1">
            Manage event details and components
          </p>
        </div>

        <div className="space-y-6">
          {/* Event Sections - For all event types */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <EventSectionsManager
              eventId={id}
              sections={event.sections || []}
              onUpdate={refetch}
            />
          </div>

          {/* Charity Run Categories */}
          {event.type === "charity_run" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <RunCategoriesManager
                eventId={id}
                categories={event.charity_run_categories || []}
                onUpdate={refetch}
              />
            </div>
          )}

          {/* Volunteer Shifts */}
          {event.type === "volunteer" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <VolunteerShiftsManager
                eventId={id}
                shifts={event.shifts || []}
                onUpdate={refetch}
              />
            </div>
          )}

          {/* Food Donation */}
          {event.type === "food_donation" && (
            <FoodDonationForm
              eventId={id}
              existingData={event.food_donation}
              onUpdate={refetch}
            />
          )}

          {/* T-shirt Management - All event types with t-shirts */}
          {event.has_tshirt && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <EventTshirtsManager
                eventId={id}
                tshirts={event.tshirts || []}
                sizes={[
                  { id: 1, code: "XS" },
                  { id: 2, code: "S" },
                  { id: 3, code: "M" },
                  { id: 4, code: "L" },
                  { id: 5, code: "XL" },
                  { id: 6, code: "XXL" },
                ]}
                runCategories={event.charity_run_categories || []}
                eventType={event.type}
                onUpdate={refetch}
              />
            </div>
          )}

          {/* Done Button */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/ngo/events/${id}/preview`}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Preview Event
            </Link>
            <Link
              href="/ngo/events"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
