"use client";

import React from "react";
import Layout from "@/app/components/Layout";
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
} from "lucide-react";

const NGODashboardPage = () => {
  // Mock data
  const stats = [
    {
      icon: Calendar,
      label: "Active Events",
      value: "5",
      change: "+2 this month",
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      icon: Users,
      label: "Total Registrations",
      value: "245",
      change: "+45 this week",
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      icon: DollarSign,
      label: "Donations Raised",
      value: "RM 12,450",
      change: "+RM 2,100 today",
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      icon: UserCheck,
      label: "Volunteer Hours",
      value: "127",
      change: "+18 hours today",
      color: "bg-orange-50 text-orange-600",
      iconBg: "bg-orange-100",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "registration",
      title: "New Participant Registration",
      description: "Ahmad joined 'Charity Run 2024' - 10KM Marathon",
      time: "5 minutes ago",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: 2,
      type: "donation",
      title: "Donation Received",
      description: "RM 500.00 donation for Education Fund Drive",
      time: "15 minutes ago",
      icon: Heart,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      id: 3,
      type: "volunteer",
      title: "Volunteer Check-In",
      description: "Sarah checked in for Food Bank Distribution",
      time: "1 hour ago",
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      id: 4,
      type: "event",
      title: "Event Published",
      description: "Community Clean Up Day is now live",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      id: 5,
      type: "registration",
      title: "New Volunteer Registration",
      description: "Lisa signed up for Kitchen Helper role",
      time: "3 hours ago",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      name: "Charity Run 2024",
      date: "2024-02-15",
      participants: 89,
      volunteers: 12,
      status: "Published",
    },
    {
      id: 2,
      name: "Food Bank Distribution",
      date: "2024-02-18",
      participants: 0,
      volunteers: 15,
      status: "Published",
    },
    {
      id: 3,
      name: "Beach Cleanup Initiative",
      date: "2024-02-25",
      participants: 45,
      volunteers: 8,
      status: "Published",
    },
  ];

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
                  <stat.icon
                    className={`h-6 w-6 ${stat.color.split(" ")[1]}`}
                  />
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activities
                </h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
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
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                View All Activities
              </button>
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
                {upcomingEvents.map((event) => (
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
                      📅 {new Date(event.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>👥 {event.participants} participants</span>
                      <span>🙋 {event.volunteers} volunteers</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NGODashboardPage;
