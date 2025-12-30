"use client";

import React, { useState } from "react";
import Layout from "@/app/components/Layout";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Gift,
  Award,
  TrendingUp,
  CheckCheck,
  Filter,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NotificationsPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock notifications
  const allNotifications = [
    {
      id: 1,
      type: "event",
      title: "Event Registration Confirmed",
      message:
        "Your registration for 'Charity Run 2024' has been confirmed. Your BIB number is A-1234.",
      time: "2 hours ago",
      read: false,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      type: "donation",
      title: "Thank You for Your Donation",
      message:
        "Your donation of RM 100.00 to Education Fund Drive has been received. Receipt is available.",
      time: "5 hours ago",
      read: false,
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: 3,
      type: "certificate",
      title: "Certificate Ready for Download",
      message:
        "Your certificate for 'Food Bank Volunteer 2024' is now available for download.",
      time: "1 day ago",
      read: true,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      type: "event",
      title: "Event Reminder",
      message:
        "Reminder: 'Walkathon for Education' is happening tomorrow at 7:00 AM. Don't forget your BIB!",
      time: "1 day ago",
      read: false,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 5,
      type: "update",
      title: "Volunteer Shift Update",
      message:
        "Your volunteer shift for 'Community Kitchen Helper' has been confirmed for Feb 18, 2PM-6PM.",
      time: "2 days ago",
      read: true,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 6,
      type: "donation",
      title: "Donation Impact Report",
      message:
        "Your donations have helped provide meals for 50 families this month. Thank you!",
      time: "3 days ago",
      read: true,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 7,
      type: "event",
      title: "Event Cancelled",
      message:
        "Unfortunately, 'Beach Cleanup Day' scheduled for Mar 5 has been cancelled due to weather.",
      time: "3 days ago",
      read: true,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 8,
      type: "certificate",
      title: "Achievement Unlocked",
      message:
        "Congratulations! You've earned the 'Active Volunteer' badge for completing 40+ hours.",
      time: "4 days ago",
      read: true,
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: 9,
      type: "update",
      title: "Payment Processed",
      message:
        "Your payment of RM 50.00 for 'Charity Run 2024' has been successfully processed.",
      time: "5 days ago",
      read: true,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 10,
      type: "event",
      title: "New Event Available",
      message:
        "Check out the new event 'Marathon for Mental Health' happening next month!",
      time: "1 week ago",
      read: true,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
  ];

  // Filter and search
  const filteredNotifications = allNotifications.filter((notif) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notif.read) ||
      (filter === "read" && notif.read);

    const matchesSearch =
      searchQuery === "" ||
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getNotificationIcon = (type) => {
    const icons = {
      event: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
      donation: { icon: Gift, color: "text-purple-600", bg: "bg-purple-100" },
      certificate: {
        icon: Award,
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
      update: {
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      },
    };
    return icons[type] || icons.update;
  };

  const markAsRead = (id) => {
    // In real app, this would update via API
    console.log("Mark as read:", id);
  };

  const deleteNotification = (id) => {
    // In real app, this would delete via API
    console.log("Delete notification:", id);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with your activities and events
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter */}
            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === option.value
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm">
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} of{" "}
          {filteredNotifications.length} notifications
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {paginatedNotifications.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Notifications Found
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedNotifications.map((notif) => {
                const iconData = getNotificationIcon(notif.type);
                const IconComponent = iconData.icon;

                return (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notif.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full ${iconData.bg} flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`h-6 w-6 ${iconData.color}`}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!notif.read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Stay Informed
              </h3>
              <p className="text-sm text-blue-700">
                Get real-time updates about your event registrations, payment
                confirmations, certificate availability, and important
                announcements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
