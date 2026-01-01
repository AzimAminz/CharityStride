"use client";

import React from "react";
import Layout from "@/app/components/Layout";
import { api } from "../../lib/api";
import {
  Calendar,
  Users,
  Gift,
  TrendingUp,
  Clock,
  Award,
  Plus,
  ArrowRight,
  DollarSign,
  UserCheck,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NGODashboardPage = () => {
  const [data, setData] = React.useState({
    stats: [],
    recentActivities: [],
    upcomingEvents: [],
  });
  const [pagination, setPagination] = React.useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });
  const [filters, setFilters] = React.useState({
    search: "",
    type: "", // all, registration, volunteer, donation, event
    sort: "latest", // latest, oldest
    page: 1,
  });
  const [loading, setLoading] = React.useState(true);
  const [activitiesLoading, setActivitiesLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchDashboardData = async (
    currentFilters = filters,
    isInitial = false
  ) => {
    try {
      if (isInitial) setLoading(true);
      else setActivitiesLoading(true);

      const params = new URLSearchParams({
        search: currentFilters.search,
        type: currentFilters.type,
        sort: currentFilters.sort,
        page: currentFilters.page,
      });

      const response = await api.get(`/ngo/dashboard?${params.toString()}`);
      setData(response.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
      setActivitiesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData(filters, true);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (loading) return; // Don't trigger on initial load

    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, page: 1 }));
      fetchDashboardData({ ...filters, page: 1 });
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Handle sort and page changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchDashboardData(updatedFilters);
  };

  // Icon mapping for backend strings
  const getIcon = (iconName) => {
    const icons = {
      calendar: Calendar,
      users: Users,
      heart: Heart,
      "user-check": UserCheck,
      "dollar-sign": DollarSign,
    };
    return icons[iconName] || Clock;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("MYR", "RM");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center p-4 text-center">
          <div className="max-w-md">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-4 font-medium">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { stats, recentActivities, upcomingEvents } = data;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's an overview of your organization's activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  {React.createElement(getIcon(stat.icon), {
                    className: `h-6 w-6 ${
                      stat.color?.split(" ")[1] || "text-emerald-600"
                    }`,
                  })}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-xs text-emerald-600 font-medium">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Activities
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Track updates across all your events
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search anything..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full sm:w-48"
                    />
                  </div>

                  <select
                    value={filters.type}
                    onChange={(e) =>
                      handleFilterChange({ type: e.target.value, page: 1 })
                    }
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">All Types</option>
                    <option value="registration">Participants</option>
                    <option value="volunteer">Volunteers</option>
                    <option value="donation">Donations</option>
                    <option value="event">Events</option>
                  </select>

                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      handleFilterChange({ sort: e.target.value, page: 1 })
                    }
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>

              <div
                className={`space-y-4 relative ${
                  activitiesLoading ? "opacity-50" : ""
                }`}
              >
                {activitiesLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                    >
                      <div className={`p-3 rounded-lg ${activity.bg} shrink-0`}>
                        {React.createElement(getIcon(activity.icon), {
                          className: `h-5 w-5 ${activity.color}`,
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 break-words">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {filters.search
                        ? "No matches found"
                        : "No recent activities found"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {filters.search
                        ? "Try a different search term"
                        : "Activities will appear here as they happen"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.current_page - 1) * pagination.per_page + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.current_page * pagination.per_page,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleFilterChange({
                          page: pagination.current_page - 1,
                        })
                      }
                      disabled={
                        pagination.current_page === 1 || activitiesLoading
                      }
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() =>
                        handleFilterChange({
                          page: pagination.current_page + 1,
                        })
                      }
                      disabled={
                        pagination.current_page === pagination.last_page ||
                        activitiesLoading
                      }
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Upcoming Events */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <a
                  href="/ngo/events/create"
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-emerald-600">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">
                      Create Event
                    </p>
                    <p className="text-xs text-emerald-700">
                      Start a new event
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="/ngo/registrations"
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      View Registrations
                    </p>
                    <p className="text-xs text-gray-600">Check participants</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="/ngo/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-purple-200 hover:bg-purple-50 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-purple-100">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      View Analytics
                    </p>
                    <p className="text-xs text-gray-600">Performance reports</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {event.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {event.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        📅{" "}
                        {event.date !== "TBD"
                          ? new Date(event.date).toLocaleDateString()
                          : "TBD"}
                      </p>
                      <div className="flex flex-col gap-3 mt-4 text-xs text-gray-600">
                        {event.has_participant && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                👥 Participants
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {event.participants}
                                {event.participant_capacity > 0
                                  ? ` / ${event.participant_capacity}`
                                  : " registered"}
                              </span>
                            </div>
                            {event.participant_capacity > 0 && (
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (event.participants /
                                        event.participant_capacity) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {event.has_volunteer && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium">
                                🙋 Volunteers
                              </span>
                              <span className="text-gray-900 font-semibold">
                                {event.volunteers}
                                {event.volunteer_capacity > 0
                                  ? ` / ${event.volunteer_capacity}`
                                  : " registered"}
                              </span>
                            </div>
                            {event.volunteer_capacity > 0 && (
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (event.volunteers /
                                        event.volunteer_capacity) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {event.has_donation && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-medium text-emerald-700">
                                💰 Donations Raised
                              </span>
                              <span className="text-emerald-600 font-bold">
                                {formatCurrency(event.donations_raised)}
                                {event.donation_target > 0 && (
                                  <span className="text-gray-400 font-normal">
                                    {" "}
                                    / {formatCurrency(event.donation_target)}
                                  </span>
                                )}
                              </span>
                            </div>
                            {event.donation_target > 0 && (
                              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (event.donations_raised /
                                        event.donation_target) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">
                      No upcoming events
                    </p>
                    <a
                      href="/ngo/events/create"
                      className="text-emerald-600 text-xs hover:underline mt-1 inline-block"
                    >
                      Create your first event
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NGODashboardPage;
