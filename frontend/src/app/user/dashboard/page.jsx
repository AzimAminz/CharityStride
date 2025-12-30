"use client";

import React from "react";
import Layout from "@/app/components/Layout";
import {
  Calendar,
  Users,
  Award,
  Receipt,
  TrendingUp,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  // Mock user data
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const stats = [
    {
      icon: Calendar,
      label: "Events Joined",
      value: "12",
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      icon: Users,
      label: "Volunteer Hours",
      value: "45.5",
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      icon: Receipt,
      label: "Total Donated",
      value: "RM 850.00",
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      icon: Award,
      label: "Certificates",
      value: "8",
      color: "bg-orange-50 text-orange-600",
      iconBg: "bg-orange-100",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "registration",
      title: "Registered for Charity Run 2024",
      description: "Successfully registered as participant - 10KM Marathon",
      date: "2 hours ago",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Confirmed",
      description: "RM 50.00 - Registration fee paid for Charity Run 2024",
      date: "5 hours ago",
      icon: Receipt,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      id: 3,
      type: "certificate",
      title: "Certificate Available",
      description: "Food Bank Volunteer 2024 certificate ready for download",
      date: "1 day ago",
      icon: Award,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      id: 4,
      type: "volunteer",
      title: "Volunteer Shift Completed",
      description: "Community Kitchen Helper - 4 hours logged",
      date: "2 days ago",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      id: 5,
      type: "donation",
      title: "Donation Received",
      description: "Thank you for your RM 100.00 donation to Education Fund",
      date: "3 days ago",
      icon: Receipt,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your activities and contributions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon
                    className={`h-6 w-6 ${stat.color.split(" ")[1]}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/events"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Events</p>
                <p className="text-sm text-gray-600">Find events to join</p>
              </div>
            </a>

            <a
              href="/user/registrations"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Registrations</p>
                <p className="text-sm text-gray-600">View your activities</p>
              </div>
            </a>

            <a
              href="/user/certificates"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Certificates</p>
                <p className="text-sm text-gray-600">
                  Download your certificates
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activities
            </h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
              >
                <div className={`p-3 rounded-lg ${activity.bg}`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {activity.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
