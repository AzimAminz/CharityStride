"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

/**
 * A horizontal scrolling carousel for event thumbnails.
 * Displays up to 6 items.
 */
const ThumbnailCarousel = ({ title, events = [], link }) => {
  const scrollContainerRef = useRef(null);

  // Limit to 6 items
  const displayEvents = events.slice(0, 6);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8; // Scroll 80% of view
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!displayEvents.length) return null;

  return (
    <div className="w-full mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {link && (
          <Link
            href={link}
            className="text-amber-400 hover:text-amber-500 font-bold text-sm transition-colors uppercase tracking-wide"
          >
            Show More
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1/2 hover:scale-110 disabled:opacity-0"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scroll Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          {displayEvents.map((event) => (
            <Link
              href={`/events/${event.id}`}
              key={event.id}
              className="flex-none w-[280px] md:w-[320px] aspect-[16/9] relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 snap-start"
            >
              {event.thumbnail ? (
                <Image
                  src={event.thumbnail}
                  alt={event.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <Users size={32} />
                </div>
              )}

              {/* Optional Gradient Overlay for Title? User asked for "image only" style like Popular, 
                  but Popular has no text. The screenshot provided shows purely images. 
                  So we keep it purely images. */}
            </Link>
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1/2 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ThumbnailCarousel;
