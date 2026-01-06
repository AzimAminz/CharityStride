"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const AdminReportsPage = () => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(null);
  const [overview, setOverview] = useState(null);
  const [graphData, setGraphData] = useState({
    revenue: [],
    ngoPerformance: [],
    eventAnalytics: [],
  });

  const reports = [
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Detailed breakdown of all donations and payments",
      icon: DollarSign,
      color: "emerald",
      endpoint: "/reports/revenue",
      graphEndpoint: "/reports/revenue/graph",
      graphType: "line",
    },
    {
      id: "ngo-performance",
      title: "NGO Performance",
      description: "Performance metrics for all registered NGOs",
      icon: Building2,
      color: "blue",
      endpoint: "/reports/ngo-performance",
      graphEndpoint: "/reports/ngo-performance/graph",
      graphType: "bar",
    },
    {
      id: "event-analytics",
      title: "Event Analytics",
      description: "Comprehensive event statistics and engagement",
      icon: Activity,
      color: "purple",
      endpoint: "/reports/event-analytics",
      graphEndpoint: "/reports/event-analytics/graph",
      graphType: "multibar",
    },
    {
      id: "user-activity",
      title: "User Activity",
      description: "User participation and engagement metrics",
      icon: Users,
      color: "rose",
      endpoint: "/reports/user-activity",
    },
  ];

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(
        `${baseUrl}/api/admin/reports/platform-overview?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch overview");
      const data = await response.json();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGraphData = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const [revenueRes, ngoRes, eventRes] = await Promise.all([
        fetch(
          `${baseUrl}/api/admin/reports/revenue/graph?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),
        fetch(
          `${baseUrl}/api/admin/reports/ngo-performance/graph?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),
        fetch(
          `${baseUrl}/api/admin/reports/event-analytics/graph?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        ),
      ]);

      const [revenueData, ngoData, eventData] = await Promise.all([
        revenueRes.ok ? revenueRes.json() : Promise.resolve([]),
        ngoRes.ok ? ngoRes.json() : Promise.resolve([]),
        eventRes.ok ? eventRes.json() : Promise.resolve([]),
      ]);

      setGraphData({
        revenue: Array.isArray(revenueData) ? revenueData : [],
        ngoPerformance: Array.isArray(ngoData) ? ngoData : [],
        eventAnalytics: Array.isArray(eventData) ? eventData : [],
      });
    } catch (err) {
      console.error("Failed to fetch graph data:", err);
    }
  };

  const downloadReport = async (report) => {
    setLoading(report.id);
    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(
        `${baseUrl}/api/admin${report.endpoint}?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.id}_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to download report. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  React.useEffect(() => {
    fetchOverview();
    fetchGraphData();
  }, [startDate, endDate]);

  const colorConfig = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const renderGraph = (report) => {
    if (!report.graphEndpoint) return null;

    let data = [];
    if (report.id === "revenue") {
      data = graphData.revenue;
    } else if (report.id === "ngo-performance") {
      data = graphData.ngoPerformance;
    } else if (report.id === "event-analytics") {
      data = graphData.eventAnalytics;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No data available for the selected date range
        </div>
      );
    }

    if (report.graphType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `RM ${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "12px",
              }}
              formatter={(value) => [`RM ${value}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else if (report.graphType === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "12px",
              }}
            />
            <Bar
              dataKey="total_raised"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              name="Total Raised (RM)"
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (report.graphType === "multibar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "12px",
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar
              dataKey="participants"
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
              name="Participants"
            />
            <Bar
              dataKey="volunteers"
              fill="#ec4899"
              radius={[6, 6, 0, 0]}
              name="Volunteers"
            />
            <Bar
              dataKey="donations"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              name="Donations"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Platform <span className="text-emerald-600">Reports</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Generate comprehensive reports and export data
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h3 className="text-xl font-black text-gray-900">Date Range</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Platform Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Users"
            value={overview.total_users}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="NGOs"
            value={overview.total_ngos}
            icon={Building2}
            color="emerald"
          />
          <StatCard
            title="Events"
            value={overview.total_events}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Revenue"
            value={`RM ${(overview.total_revenue / 100).toLocaleString()}`}
            icon={DollarSign}
            color="rose"
          />
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isLoading = loading === report.id;

          return (
            <motion.div
              key={report.id}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-4 rounded-3xl ${
                      colorConfig[report.color]
                    } border`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-gray-500 font-medium text-sm">
                      {report.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => downloadReport(report)}
                  disabled={isLoading}
                  className="py-3 px-6 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download CSV
                    </>
                  )}
                </button>
              </div>

              {/* Graph */}
              {report.graphEndpoint && (
                <div className="mt-6 bg-gray-50 rounded-2xl p-6">
                  {renderGraph(report)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorConfig = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
      <div
        className={`p-3 rounded-2xl ${colorConfig[color]} border w-fit mb-4`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-gray-500 font-bold text-xs mb-1 uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
    </div>
  );
};

export default AdminReportsPage;
