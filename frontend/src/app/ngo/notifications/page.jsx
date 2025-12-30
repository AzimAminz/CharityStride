"use client";

import React, { useState } from "react";
import Layout from "@/app/components/Layout";
import {
  Bell,
  Check,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  CheckCheck,
  AlertCircle,
  Clock,
  Calendar,
} from "lucide-react";

const NotificationsPage = () => {
  const [filter, setFilter] = useState("all");

  // Mock notifications - akan diganti dengan data dari API
  const notifications = [];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
  ];

  const getNotificationIcon = (type) => {
    const icons = {
      registration: { icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
      donation: {
        icon: DollarSign,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      alert: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
      update: {
        icon: TrendingUp,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
    };
    return icons[type] || icons.update;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with event activities and important updates
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter */}
            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
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
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            // Empty State
            <div className="text-center py-16 px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Notifications
              </h3>
              <p className="text-gray-600 mb-6">
                You're all caught up! You'll be notified of new registrations,
                donations, and event updates here.
              </p>
              <a
                href="/ngo/events"
                className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                Manage Events
              </a>
            </div>
          ) : (
            // Notifications list would go here
            <div className="divide-y divide-gray-200">
              {/* Notification items will be mapped here */}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Real-Time Updates
                </h3>
                <p className="text-sm text-blue-700">
                  Get notified instantly when users register for your events or
                  make donations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">
                  Event Reminders
                </h3>
                <p className="text-sm text-purple-700">
                  Important reminders about upcoming events and deadlines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
