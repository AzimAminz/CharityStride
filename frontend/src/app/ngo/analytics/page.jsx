"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/app/components/Layout";
import { api } from "../../lib/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Download,
  Users,
  Heart,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const NGOAnalyticsPage = () => {
  const router = useRouter();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [generatingReport, setGeneratingReport] = React.useState(false);
  const [range, setRange] = React.useState("6m");

  const fetchData = async (selectedRange = range) => {
    try {
      setLoading(true);
      const response = await api.get(`/ngo/analytics?range=${selectedRange}`);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
      setError("Failed to load analytics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData(range);
  }, [range]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("MYR", "RM");
  };

  const generatePDF = async () => {
    if (!data) return;
    setGeneratingReport(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text("CharityStride Performance Report", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${timestamp}`, 14, 30);
      doc.text("Organization Performance Overview", 14, 35);

      // Summary Stats Table
      autoTable(doc, {
        startY: 45,
        head: [["Metric", "Total Value"]],
        body: [
          ["Total Participants", data.stats.total_participants],
          ["Total Volunteers", data.stats.total_volunteers],
          ["Donations Raised", formatCurrency(data.stats.total_donations)],
          ["Volunteer Hours contributed", data.stats.total_volunteer_hours],
        ],
        theme: "grid",
        headStyles: { fillStyle: [16, 185, 129] },
      });

      // Event Performance Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Detailed Event Performance", 14, doc.lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [
          [
            "Event Name",
            "Participants",
            "Volunteers",
            "Donations",
            "Reg. Fees",
            "Total Raised",
          ],
        ],
        body: data.event_performance.map((event) => [
          event.full_name,
          event.participants,
          event.volunteers,
          event.has_donation_target
            ? `${formatCurrency(event.donations)} (${
                event.achievement_percent
              }%)`
            : formatCurrency(event.donations),
          formatCurrency(event.registration_fees),
          formatCurrency(event.total_raised),
        ]),
        theme: "striped",
        headStyles: { fillStyle: [16, 185, 129] },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount} - CharityStride NGO Analytics`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      doc.save(
        `Performance_Report_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("PDF Generation failed:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 animate-pulse">
              Analyzing your data...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md text-center">
            <p className="font-semibold mb-4">{error}</p>
            <button
              onClick={() => fetchData()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { stats, trends, event_performance } = data;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Organization Analytics
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Comprehensive overview of your social impact and growth
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="appearance-none flex items-center gap-2 pl-10 pr-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm shadow-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={generatePDF}
              disabled={generatingReport}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-lg shadow-emerald-500/20"
            >
              {generatingReport ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {generatingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Impacted Partners",
              value: stats.total_participants,
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Active Volunteers",
              value: stats.total_volunteers,
              icon: Clock,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "Community Support",
              value: formatCurrency(stats.total_donations),
              icon: Heart,
              color: "text-rose-600",
              bg: "bg-rose-50",
            },
            {
              label: "Volunteer Hours",
              value: stats.total_volunteer_hours,
              icon: TrendingUp,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Historical Total
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Registration Trend Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Registration Growth
                </h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold text-emerald-600">
                  Monthly Confirmed Counts
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Partners
                </div>
                <div className="flex items-center gap-1.5 font-medium text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-orange-400" />
                  Volunteers
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trends.registrations.map((item, idx) => ({
                    label: item.label,
                    participants: item.count,
                    volunteers: trends.volunteers[idx]?.count || 0,
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="participants"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volunteers"
                    stroke="#fb923c"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 0, fill: "#fb923c" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donation Area Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Donation Trend
                </h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold text-emerald-600">
                  Fundraising Velocity
                </p>
              </div>
              <div className="bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700">
                  Real-time Data
                </span>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.donations}>
                  <defs>
                    <linearGradient
                      id="colorDonation"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    tickFormatter={(val) => `RM ${val}`}
                  />
                  <Tooltip
                    formatter={(val) => [`RM ${val}`, "Collected"]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDonation)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section: Top Events Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Top Events Impact
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Participant vs Volunteer distribution
              </p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={event_performance} layout="vertical" barGap={8}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    tick={{ fill: "#1f2937", fontSize: 12, fontWeight: "bold" }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="participants"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                  />
                  <Bar
                    dataKey="volunteers"
                    fill="#fb923c"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  Detailed Published Event Metrics
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Full financial and engagement breakdown for live events
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 font-semibold text-gray-600 text-sm">
                      Event Name
                    </th>
                    <th className="pb-4 font-semibold text-gray-600 text-sm">
                      Partners
                    </th>
                    <th className="pb-4 font-semibold text-gray-600 text-sm">
                      Volunteers
                    </th>
                    <th className="pb-4 font-semibold text-gray-600 text-sm text-right">
                      Donations
                    </th>
                    <th className="pb-4 font-semibold text-gray-600 text-sm text-right">
                      Reg. Fees
                    </th>
                    <th className="pb-4 font-semibold text-gray-600 text-sm text-right">
                      Total Raised
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {event_performance.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td
                        className="py-4 text-sm font-medium text-gray-900 truncate max-w-[150px]"
                        title={event.full_name}
                      >
                        {event.full_name}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {event.participants}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {event.volunteers}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-gray-900 font-medium">
                            {formatCurrency(event.donations)}
                          </span>
                          {event.has_donation_target && (
                            <div className="w-full max-w-[100px] mt-1.5">
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <span className="text-[9px] font-bold text-emerald-600">
                                  {event.achievement_percent}%
                                </span>
                                <span className="text-[9px] text-gray-400">
                                  of{" "}
                                  {formatCurrency(event.donation_target_amount)}
                                </span>
                              </div>
                              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    event.achievement_percent >= 100
                                      ? "bg-emerald-500"
                                      : "bg-emerald-400"
                                  }`}
                                  style={{
                                    width: `${event.achievement_percent}%`,
                                    maxWidth: "100%",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-900 font-medium text-right">
                        {formatCurrency(event.registration_fees)}
                      </td>
                      <td className="py-4 text-sm text-emerald-600 font-bold text-right">
                        {formatCurrency(event.total_raised)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NGOAnalyticsPage;
