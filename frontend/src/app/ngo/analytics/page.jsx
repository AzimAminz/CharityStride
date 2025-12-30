"use client";

import React, { useState } from "react";
import Layout from "@/app/components/Layout";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  Download,
  BarChart3,
  PieChart,
  Award,
} from "lucide-react";

const NGOAnalyticsPage = () => {
  const [dateRange, setDateRange] = useState("30days");

  // Mock summary stats
  const summaryStats = [
    {
      label: "Total Events",
      value: "12",
      change: "+3",
      trend: "up",
      period: "vs last month",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Participants",
      value: "1,245",
      change: "+18%",
      trend: "up",
      period: "vs last month",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Donations Raised",
      value: "RM 45,820",
      change: "+22%",
      trend: "up",
      period: "vs last month",
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Volunteer Hours",
      value: "892",
      change: "-5%",
      trend: "down",
      period: "vs last month",
      icon: UserCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  // Mock event performance
  const eventPerformance = [
    {
      id: 1,
      name: "Charity Run 2024",
      date: "2024-02-15",
      participants: 245,
      volunteers: 28,
      donations: 12450,
      target: 10000,
      status: "completed",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Food Bank Distribution",
      date: "2024-02-18",
      participants: 0,
      volunteers: 45,
      donations: 5200,
      target: 5000,
      status: "completed",
      rating: 4.6,
    },
    {
      id: 3,
      name: "Beach Cleanup Initiative",
      date: "2024-02-25",
      participants: 156,
      volunteers: 22,
      donations: 3800,
      target: 5000,
      status: "upcoming",
      rating: null,
    },
    {
      id: 4,
      name: "Education Workshop",
      date: "2024-01-28",
      participants: 89,
      volunteers: 12,
      donations: 8900,
      target: 8000,
      status: "completed",
      rating: 4.9,
    },
    {
      id: 5,
      name: "Community Kitchen",
      date: "2024-01-15",
      participants: 0,
      volunteers: 35,
      donations: 6500,
      target: 6000,
      status: "completed",
      rating: 4.7,
    },
  ];

  // Mock monthly donation trends (last 6 months)
  const donationTrends = [
    { month: "Sep", amount: 8500 },
    { month: "Oct", amount: 12000 },
    { month: "Nov", amount: 9800 },
    { month: "Dec", amount: 15200 },
    { month: "Jan", amount: 18500 },
    { month: "Feb", amount: 22100 },
  ];

  const maxDonation = Math.max(...donationTrends.map((d) => d.amount));

  // Mock registration conversion
  const conversionStats = {
    pageViews: 4580,
    registrationStarts: 892,
    completedRegistrations: 678,
    conversionRate: 76,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics & Reports
              </h1>
              <p className="text-gray-600 mt-2">
                Track performance, donations, and volunteer engagement
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="year">This year</option>
              </select>

              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">{stat.period}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Donation Trends Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Donation Trends (RM)
              </h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {donationTrends.map((trend, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {trend.month}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      RM {trend.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${(trend.amount / maxDonation) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total (6 months)</span>
                <span className="text-lg font-bold text-emerald-600">
                  RM{" "}
                  {donationTrends
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Registration Conversion Funnel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Conversion Funnel
              </h2>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Page Views</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {conversionStats.pageViews}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">
                    Started Registration
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {conversionStats.registrationStarts}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (conversionStats.registrationStarts /
                          conversionStats.pageViews) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(
                    (conversionStats.registrationStarts /
                      conversionStats.pageViews) *
                    100
                  ).toFixed(1)}
                  % conversion
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Completed</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {conversionStats.completedRegistrations}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${
                        (conversionStats.completedRegistrations /
                          conversionStats.pageViews) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(
                    (conversionStats.completedRegistrations /
                      conversionStats.pageViews) *
                    100
                  ).toFixed(1)}
                  % conversion
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  Overall Conversion Rate
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {conversionStats.conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Performance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Event Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventPerformance.map((event) => {
                  const progress = (event.donations / event.target) * 100;
                  const isCompleted = event.status === "completed";

                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {event.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.participants}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.volunteers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          RM {event.donations.toLocaleString()}
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              progress >= 100 ? "bg-green-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        RM {event.target.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.rating ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {event.rating}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NGOAnalyticsPage;
