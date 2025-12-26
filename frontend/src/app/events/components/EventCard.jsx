"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users } from "lucide-react";

const EventCard = ({ event, distance = null, showDistance = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryBadges = () => {
    const badges = [];
    if (event.has_volunteer)
      badges.push({ label: "Volunteer", color: "bg-blue-100 text-blue-700" });
    if (event.has_donation)
      badges.push({ label: "Donation", color: "bg-green-100 text-green-700" });
    if (event.has_participant)
      badges.push({
        label: "Participant",
        color: "bg-purple-100 text-purple-700",
      });
    return badges;
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {event.thumbnail ? (
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <Users className="w-16 h-16 text-white opacity-50" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {getCategoryBadges().map((badge, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color} backdrop-blur-sm`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* Distance Badge */}
          {showDistance && distance !== null && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
              {distance < 1
                ? `${(distance * 1000).toFixed(0)}m`
                : `${distance.toFixed(1)}km`}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* NGO Name */}
          <div className="flex items-center gap-2 mb-2">
            {event.ngo?.logo_url && (
              <Image
                src={event.ngo.logo_url}
                alt={event.ngo.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-gray-500 font-medium">
              {event.ngo?.name || "Unknown NGO"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {event.description}
          </p>

          {/* Footer Info */}
          <div className="space-y-2 text-sm text-gray-500">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {event.has_event_date && event.event_date
                  ? formatDate(event.event_date)
                  : `${formatDate(event.start_date)} - ${formatDate(
                      event.end_date
                    )}`}
              </span>
            </div>

            {/* Location */}
            {event.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">
                  {event.city
                    ? `${event.city}, ${event.state || ""}`
                    : event.address}
                </span>
              </div>
            )}

            {/* Registration Count */}
            {event.registration_count > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{event.registration_count} registered</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
