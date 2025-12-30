"use client";

import React, { useState, useEffect } from "react";
import Echo from "../../lib/echo";
import Layout from "@/app/components/Layout";
import {
  Calendar,
  Users,
  UserCheck,
  Heart,
  ArrowRight,
  Search,
  TrendingUp,
} from "lucide-react";
import { getEvents } from "../../lib/events";

const NGORegistrationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, name-asc, name-desc, registrations-desc

  const [loading, setLoading] = useState(true);
  const [publishedEvents, setPublishedEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents({ user_id: "me" }); // Fetch events for current NGO
        // Handle paginated response
        const events = response.data || response;
        console.log("Fetched events for NGO:", events);
        if (Array.isArray(events)) {
          const published = events.filter(
            (e) => e.is_published || e.status === "open" || e.is_published === 1
          );
          console.log("Filtered published events:", published);
          setPublishedEvents(published);
        } else {
          console.error("Unexpected events data format:", response);
          setPublishedEvents([]);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // WebSocket listener for new registrations
  useEffect(() => {
    if (!publishedEvents.length || !Echo) return;

    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    const ngoId = user?.ngo_id;
    if (!ngoId) return;

    const channel = Echo.channel(`ngo.${ngoId}`);

    channel.listen("registration.created", (data) => {
      console.log("New registration received:", data);

      // Update the specific event in the list
      setPublishedEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === data.event_id) {
            return {
              ...event,
              stats: data.stats,
            };
          }
          return event;
        })
      );
    });

    return () => {
      if (Echo && ngoId) {
        channel.stopListening("registration.created");
        Echo.leave(`ngo.${ngoId}`);
      }
    };
  }, [publishedEvents.length]);

  // Filter events by search
  const filteredEvents = publishedEvents.filter(
    (event) =>
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.start_date) - new Date(a.start_date);
      case "date-asc":
        return new Date(a.start_date) - new Date(b.start_date);
      case "name-asc":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      case "registrations-desc":
        const aTotal =
          (a.stats?.participants || 0) + (a.stats?.volunteers || 0);
        const bTotal =
          (b.stats?.participants || 0) + (b.stats?.volunteers || 0);
        return bTotal - aTotal;
      default:
        return 0;
    }
  });

  const totalRegistrations = publishedEvents.reduce(
    (sum, event) =>
      sum + (event.stats?.participants || 0) + (event.stats?.volunteers || 0),
    0
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrations</h1>
          <p className="text-gray-600 mt-2">
            Select an event to view and manage registrations
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Published Events</p>
            <p className="text-3xl font-bold text-gray-900">
              {publishedEvents.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Participants</p>
            <p className="text-3xl font-bold text-gray-900">
              {publishedEvents.reduce(
                (sum, e) => sum + (e.stats?.participants || 0),
                0
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Volunteers</p>
            <p className="text-3xl font-bold text-gray-900">
              {publishedEvents.reduce(
                (sum, e) => sum + (e.stats?.volunteers || 0),
                0
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Donations</p>
            <p className="text-3xl font-bold text-gray-900">
              {publishedEvents.reduce(
                (sum, e) => sum + (e.stats?.donations || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="registrations-desc">Most Registrations</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {sortedEvents.length} event
          {sortedEvents.length !== 1 ? "s" : ""}
        </div>

        {/* Events Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "You haven't published any events yet"}
              </p>
              {!searchQuery && (
                <a
                  href="/ngo/events/create"
                  className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Your First Event
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {sortedEvents.map((event) => {
                return (
                  <a
                    key={event.id}
                    href={`/ngo/registrations/${event.id}`}
                    className="group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer"
                  >
                    {/* Event Image */}
                    <div className="h-40 bg-gradient-to-br from-emerald-100 via-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <Calendar className="h-16 w-16 text-emerald-600 opacity-30" />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {event.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors">
                        {event.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats - Dynamic based on event modules */}
                      <div
                        className="grid gap-2 mb-4"
                        style={{
                          gridTemplateColumns: `repeat(${
                            [
                              event.has_participant,
                              event.has_volunteer,
                              event.has_donation,
                            ].filter(Boolean).length || 1
                          }, 1fr)`,
                        }}
                      >
                        {event.has_participant && (
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">
                              Participants
                            </p>
                            <p className="font-bold text-blue-600">
                              {event.stats?.participants || 0}
                            </p>
                          </div>
                        )}
                        {event.has_volunteer && (
                          <div className="text-center p-2 bg-orange-50 rounded-lg">
                            <UserCheck className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Volunteers</p>
                            <p className="font-bold text-orange-600">
                              {event.stats?.volunteers || 0}
                            </p>
                          </div>
                        )}
                        {event.has_donation && (
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <Heart className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Donations</p>
                            <p className="font-bold text-purple-600">
                              {event.stats?.donations || 0}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Total:{" "}
                          {(event.stats?.participants || 0) +
                            (event.stats?.volunteers || 0) +
                            (event.stats?.donations || 0)}
                        </span>
                        <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Event-Based Registration Management
              </h3>
              <p className="text-sm text-blue-700">
                Click on any event card to view detailed registrations, manage
                check-ins, and export data for that specific event.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NGORegistrationsPage;
