"use client";

import { useEventDetail } from "../../../../hooks/useEventDetail";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  DollarSign,
  Trophy,
  Edit,
  Eye,
  Package,
  Shirt,
  Award,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";

/**
 * NGO Event Preview Page
 * Shows how the published event will look to users with ALL registration options
 */
export default function EventPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { event, loading, error } = useEventDetail(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-[6px] border-solid border-emerald-600 border-r-transparent mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading preview...
          </p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error || "Event not found"}</p>
          <Link
            href="/ngo/events"
            className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* NGO PREVIEW BANNER - Sticky */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Eye className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="font-black text-lg uppercase tracking-wide">
                Preview Mode
              </p>
              <p className="text-sm text-white/90">
                This is how users will see your event
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/ngo/events/${id}/edit`}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-md font-bold flex items-center gap-2 border border-white/30"
            >
              <Edit className="h-5 w-5" />
              Edit Event
            </Link>
            <Link
              href="/ngo/events"
              className="px-6 py-3 bg-white hover:bg-white/90 text-orange-600 rounded-xl transition-all font-bold flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* HERO SECTION - Beautiful Thumbnail Style */}
      <div className="relative h-[500px] overflow-hidden">
        {event.thumbnail ? (
          <>
            <img
              src={event.thumbnail}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
            {/* Module Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {event.has_volunteer && (
                <span className="px-5 py-2 bg-blue-500/90 backdrop-blur-lg text-white rounded-full font-bold text-sm shadow-lg border-2 border-white/30">
                  <Users className="h-4 w-4 inline mr-2" />
                  Volunteer
                </span>
              )}
              {event.has_donation && (
                <span className="px-5 py-2 bg-orange-500/90 backdrop-blur-lg text-white rounded-full font-bold text-sm shadow-lg border-2 border-white/30">
                  <Heart className="h-4 w-4 inline mr-2" />
                  Donation
                </span>
              )}
              {event.has_participant && (
                <span className="px-5 py-2 bg-purple-500/90 backdrop-blur-lg text-white rounded-full font-bold text-sm shadow-lg border-2 border-white/30">
                  <Trophy className="h-4 w-4 inline mr-2" />
                  Participant
                </span>
              )}
              <span className="px-5 py-2 bg-emerald-500/90 backdrop-blur-lg text-white rounded-full font-bold text-sm shadow-lg border-2 border-white/30 capitalize">
                {event.status}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
              {event.title}
            </h1>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
                <Calendar className="h-6 w-6 text-white" />
                <div>
                  <p className="text-white/80 text-xs font-semibold">
                    Event Date
                  </p>
                  <p className="text-white font-bold">
                    {new Date(event.start_date).toLocaleDateString("en-MY", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Event */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-black text-gray-900 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Event Sections */}
            {event.sections && event.sections.length > 0 && (
              <div className="space-y-6">
                {event.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6">
                      <h3 className="text-2xl font-black text-white">
                        {section.title}
                      </h3>
                    </div>
                    <div className="p-8">
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        {section.content}
                      </p>

                      {section.images && section.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {section.images.map((image, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative aspect-square rounded-xl overflow-hidden shadow-lg group"
                            >
                              <img
                                src={image}
                                alt={`${section.title} ${imgIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VOLUNTEER SECTION */}
            {event.has_volunteer &&
              event.volunteer_roles &&
              event.volunteer_roles.length > 0 && (
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-blue-900">
                      Volunteer Opportunities
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {event.volunteer_roles.map((role) => (
                      <div
                        key={role.id}
                        className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-blue-500"
                      >
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {role.role_name}
                        </h3>
                        {role.description && (
                          <p className="text-gray-600 mb-4">
                            {role.description}
                          </p>
                        )}

                        {/* Shifts */}
                        {role.shifts && role.shifts.length > 0 && (
                          <div className="mt-6">
                            <p className="text-sm font-bold text-gray-500 uppercase mb-4">
                              Available Shifts ({role.shifts.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {role.shifts.map((shift) => (
                                <div
                                  key={shift.id}
                                  className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <span className="font-bold text-gray-900">
                                      {new Date(
                                        shift.shift_date
                                      ).toLocaleDateString("en-MY", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-700">
                                      {shift.start_time} - {shift.end_time}
                                    </span>
                                  </div>
                                  {shift.location && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <MapPin className="h-5 w-5 text-blue-600" />
                                      <span className="text-gray-700 text-sm">
                                        {shift.location}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                                    <span className="text-sm text-gray-600">
                                      Capacity:
                                    </span>
                                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">
                                      {shift.capacity} slots
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* PARTICIPANT SECTION */}
            {event.has_participant &&
              event.participant_categories &&
              event.participant_categories.length > 0 && (
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-purple-600 rounded-2xl shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-purple-900">
                      Participant Registration
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.participant_categories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden border-2 border-purple-200"
                      >
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {category.category_name}
                        </h3>

                        {category.description && (
                          <p className="text-gray-600 mb-4">
                            {category.description}
                          </p>
                        )}

                        {/* Fee */}
                        {category.has_fee && category.base_fee && (
                          <div className="flex items-end justify-between py-4 border-y-4 border-purple-300 my-4">
                            <span className="text-gray-700 font-bold">
                              Registration Fee
                            </span>
                            <span className="text-4xl font-black text-purple-600">
                              RM {(category.base_fee / 100).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-3 mb-6">
                          {category.capacity && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Users className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-semibold">
                                  Capacity
                                </p>
                                <p className="font-bold text-gray-900">
                                  {category.capacity} slots
                                </p>
                              </div>
                            </div>
                          )}

                          {category.event_date && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Calendar className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-semibold">
                                  Event Date
                                </p>
                                <p className="font-bold text-gray-900">
                                  {new Date(
                                    category.event_date
                                  ).toLocaleDateString("en-MY", {
                                    weekday: "short",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  {category.event_time &&
                                    ` at ${category.event_time}`}
                                </p>
                              </div>
                            </div>
                          )}

                          {category.location_name && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <MapPin className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-semibold">
                                  Location
                                </p>
                                <p className="font-bold text-gray-900">
                                  {category.location_name}
                                </p>
                                {category.location_details && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {category.location_details}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* T-Shirt Perks */}
                          {(category.has_event_tshirt ||
                            category.has_finisher_tshirt) && (
                            <div className="pt-3">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                                Included Perks
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {category.has_event_tshirt && (
                                  <span className="px-3 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm flex items-center gap-2">
                                    <Shirt className="h-4 w-4" />
                                    Event T-Shirt
                                  </span>
                                )}
                                {category.has_finisher_tshirt && (
                                  <span className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold text-sm flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Finisher T-Shirt
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Register Button */}
                        <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all">
                          Register for This Category
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT SIDEBAR - Donation (Sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* DONATION SECTION */}
            {event.has_donation && (
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-orange-900">
                    Support Us
                  </h2>
                </div>

                {/* Money Donations */}
                {event.money_donation_options &&
                  event.money_donation_options.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-bold text-orange-800 uppercase mb-4">
                        Quick Donate
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {event.money_donation_options.map((option) => (
                          <button
                            key={option.id}
                            className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-2xl transition-all border-4 border-orange-200 hover:border-orange-500 transform hover:scale-105"
                          >
                            <p className="text-3xl font-black text-orange-600 mb-1">
                              RM {(option.suggested_amount / 100).toFixed(0)}
                            </p>
                            {option.description && (
                              <p className="text-xs text-gray-600 font-semibold">
                                {option.description}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                      <button className="w-full mt-4 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-bold shadow-xl transition-all">
                        Donate Any Amount
                      </button>
                    </div>
                  )}

                {/* Item Donations */}
                {event.item_donation_options &&
                  event.item_donation_options.length > 0 && (
                    <div className="pt-6 border-t-4 border-orange-200">
                      <p className="text-sm font-bold text-orange-800 uppercase mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Items Needed ({event.item_donation_options.length})
                      </p>
                      <div className="space-y-3">
                        {event.item_donation_options.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl p-4 shadow-md border-2 border-orange-100"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-gray-900">
                                  {item.item_name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {item.category}
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm font-bold whitespace-nowrap">
                                {item.target_quantity} {item.unit}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 px-6 py-4 bg-white border-4 border-orange-400 text-orange-700 rounded-xl font-bold shadow-lg hover:bg-orange-50 transition-all">
                        Donate These Items
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Event Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <Calendar className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Event Dates</p>
                    <p className="text-gray-700">
                      {new Date(event.start_date).toLocaleDateString("en-MY", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {event.end_date !== event.start_date && (
                      <p className="text-gray-700 text-sm">
                        to{" "}
                        {new Date(event.end_date).toLocaleDateString("en-MY", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Status</p>
                    <p className="text-gray-700 capitalize">{event.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-2xl font-black mb-3">Share This Event</h3>
              <p className="text-white/90 mb-6">Help us spread the word!</p>
              <button className="w-full px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-xl font-bold transition-all border-2 border-white/40">
                Share on Social Media
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/90 text-xl mb-8 font-semibold">
            Join us and be part of something amazing!
          </p>
          <button className="px-12 py-5 bg-white hover:bg-gray-100 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-purple-600 rounded-xl font-black text-2xl shadow-2xl transition-all transform hover:scale-105 border-4 border-white">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}
