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

import { api } from "@/app/lib/api";

const activityIcons = {
  calendar: Calendar,
  users: Users,
  receipt: Receipt,
  award: Award,
};

const DashboardPage = () => {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/user/dashboard");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  const {
    stats: backendStats,
    recent_activities: allActivities,
    user,
  } = data || {};

  // Pagination Logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil((allActivities?.length || 0) / itemsPerPage);
  const recentActivities = allActivities?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = [
    {
      icon: Calendar,
      label: "Events Joined",
      value: backendStats?.total_events || "0",
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      icon: Users,
      label: "Volunteer Hours",
      value: backendStats?.total_hours || "0.0",
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      icon: Receipt,
      label: "Total Donated",
      value: backendStats?.total_donated || "RM 0.00",
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      icon: Award,
      label: "Certificates",
      value: backendStats?.certificates_count || "0",
      color: "bg-orange-50 text-orange-600",
      iconBg: "bg-orange-100",
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
            {recentActivities?.length > 0 ? (
              <>
                {recentActivities.map((activity) => {
                  const IconComponent =
                    activityIcons[activity.icon] || Calendar;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                    >
                      <div className={`p-3 rounded-lg ${activity.bg}`}>
                        <IconComponent
                          className={`h-5 w-5 ${activity.color}`}
                        />
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
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activities found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
