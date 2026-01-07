"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Users,
  CircleDollarSign,
  Navigation,
} from "lucide-react";

/**
 * Refined EventCard with user-requested changes
 */
const EventCard = ({ event, distance = null, showDistance = false }) => {
  const getEventDate = () => {
    const dateStr = event.event_date || event.start_date;
    if (!dateStr) return { month: "N/A", day: "00" };
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    };
  };

  const { month, day } = getEventDate();

  const getPrimaryCategory = () => {
    // Priority based on module modules
    if (event.has_participant) return "Event Registration";
    if (event.has_volunteer) return "Volunteer Hub";
    if (event.has_donation) return "Charity Campaign";
    return "Event";
  };

  const formatPriceRange = () => {
    return event.price_range || "Free";
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div className="group bg-white rounded-none overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full border border-gray-300">
        {/* Thumbnail Section */}
        <div className="relative h-48 w-full overflow-hidden">
          {event.thumbnail ? (
            <Image
              src={event.thumbnail}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              <Users size={48} strokeWidth={1.5} />
            </div>
          )}

          {/* Location Badge (Top Left) */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold rounded-none uppercase tracking-widest">
              {event.state || "National"}
            </span>
          </div>

          {/* Category Badge (Bottom Left) */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-yellow-400 text-gray-900 text-[10px] font-black rounded-none uppercase tracking-wider">
              {getPrimaryCategory()}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex gap-4">
            {/* Date Column */}
            <div className="flex flex-col items-center justify-start pt-1 min-w-[40px]">
              <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">
                {month}
              </span>
              <span className="text-xl font-black text-gray-900 leading-none mt-1">
                {day}
              </span>
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                {event.title}
              </h3>

              {/* Location & Time */}
              <div className="space-y-1.5 mb-4">
                {(event.city || event.state || event.address) && (
                  <div className="flex items-start gap-2 text-gray-500">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    <span className="text-xs line-clamp-1">
                      {event.city
                        ? `${event.city}, ${event.state}`
                        : event.address}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={14} className="shrink-0" />
                  <span className="text-xs uppercase tracking-tight">
                    {event.event_date
                      ? "Starts at 8:00 AM"
                      : "Open for Registration"}
                  </span>
                </div>
              </div>

              {/* Footer: Price & Distance */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs whitespace-nowrap overflow-hidden">
                  <CircleDollarSign
                    size={14}
                    className="text-gray-400 shrink-0"
                  />
                  <span className="truncate">{formatPriceRange()}</span>
                </div>

                {showDistance && distance !== null && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold shrink-0">
                    <Navigation size={12} className="fill-emerald-600" />
                    <span>
                      {distance < 1
                        ? `${(distance * 1000).toFixed(0)}m`
                        : `${distance.toFixed(1)}km`}{" "}
                      away
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
