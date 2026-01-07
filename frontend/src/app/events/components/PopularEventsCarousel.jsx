"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

const PopularEventsCarousel = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Limit to 6 events
  const carouselEvents = events.slice(0, 6);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselEvents.length);
  }, [carouselEvents.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselEvents.length - 1 : prevIndex - 1
    );
  };

  // Auto-slide effect
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  if (!carouselEvents.length) return null;

  return (
    <div
      className="relative w-full max-w-6xl mx-auto px-4 py-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-gray-800 transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg text-gray-800 transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Track Container */}
      <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px] overflow-hidden relative w-full">
        {carouselEvents.map((event, index) => {
          // Calculate relative position to handle circular wrap around visual logic
          // But for a simple centered carousel, we can just use position math based on currentIndex

          let position = "translate-x-full opacity-0 scale-75 z-0 hidden"; // Default hidden

          if (index === currentIndex) {
            position = "translate-x-0 opacity-100 scale-110 z-10"; // Active
          } else if (
            index ===
            (currentIndex - 1 + carouselEvents.length) % carouselEvents.length
          ) {
            position =
              "-translate-x-[65%] md:-translate-x-[70%] opacity-60 scale-90 z-0 blur-[1px]"; // Previous
          } else if (index === (currentIndex + 1) % carouselEvents.length) {
            position =
              "translate-x-[65%] md:translate-x-[70%] opacity-60 scale-90 z-0 blur-[1px]"; // Next
          }

          // On mobile, we might just show one, but the request implies a specific animation
          // The math above creates a coverflow-like 3-item view: [Prev] [Active] [Next]

          return (
            <Link
              href={`/events/${event.id}`}
              key={event.id}
              className={`absolute transition-all duration-700 ease-in-out w-[70vw] md:w-[500px] aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden cursor-pointer ${position}`}
            >
              {event.thumbnail ? (
                <Image
                  src={event.thumbnail}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <Users size={64} />
                </div>
              )}

              {/* Optional: Dark gradient on bottom for better image text readability if needed, 
                    but user said "image only" so we keep it clean. */}
            </Link>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {carouselEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "bg-emerald-500 w-8"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularEventsCarousel;
