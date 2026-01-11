"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building,
  Heart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import StatusModal from "@/app/components/StatusModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboardPage = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(
    searchParams.get("login") === "success"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-emerald-600 font-bold animate-pulse">
            Syncing Platform Data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 text-red-700">
          <AlertCircle className="h-6 w-6" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Platform <span className="text-emerald-600">Overview</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Real-time analytics and management for CharityStride
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {data.stats.map((stat, idx) => (
          <StatsCard key={idx} stat={stat} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Registered NGOs List */}
          <NgoListSection />

          {/* Event Analytics */}
          {data?.event_analytics && data.event_analytics.length > 0 && (
            <EventAnalyticsSection data={data.event_analytics} />
          )}

          {/* NGO Performance */}
          {data?.ngo_performance && data.ngo_performance.length > 0 && (
            <NgoPerformanceSection data={data.ngo_performance} />
          )}

          {/* Event Distribution */}
          <EventDistributionSection />
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Pending NGO Section */}
          <Section
            title="Pending NGO"
            badge={data.pending.ngos_count}
            color="emerald"
          >
            {data.pending.ngos.length > 0 ? (
              <div className="space-y-4">
                {data.pending.ngos.slice(0, 3).map((ngo) => (
                  <Link
                    href={`/admin/ngos?search=${ngo.name}`}
                    key={ngo.id}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-emerald-600 border border-emerald-100">
                          {ngo.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1 text-sm">
                            {ngo.name}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-medium uppercase">
                            {ngo.registration_no}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </Link>
                ))}
                {data.pending.ngos_count > 3 && (
                  <Link
                    href="/admin/ngos"
                    className="block text-center text-xs font-bold text-gray-500 hover:text-emerald-600 py-2 transition-colors"
                  >
                    See more ({data.pending.ngos_count - 3} more)
                  </Link>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-emerald-200 mx-auto" />
                <p className="text-xs text-gray-400 font-medium">
                  No pending NGO registrations
                </p>
              </div>
            )}
          </Section>

          {/* Publish Requests (Pending Events) Section */}
          <Section
            title="Publish Requests"
            badge={data.pending.events_count || 0}
            color="amber"
          >
            {(data.pending.events || []).length > 0 ? (
              <div className="space-y-4">
                {data.pending.events.slice(0, 3).map((event) => (
                  <Link href={`/admin/events`} key={event.id} className="block">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                            {event.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-medium">
                            By {event.ngo?.name}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </Link>
                ))}
                {(data.pending.events_count || 0) > 3 && (
                  <Link
                    href="/admin/events"
                    className="block text-center text-xs font-bold text-gray-500 hover:text-amber-600 py-2 transition-colors"
                  >
                    See more ({(data.pending.events_count || 0) - 3} more)
                  </Link>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-amber-200 mx-auto" />
                <p className="text-xs text-gray-400 font-medium">
                  No pending events
                </p>
              </div>
            )}
          </Section>

          {/* Unpublish Requests Section */}
          <Section
            title="Unpublish Request"
            badge={data.pending.unpublish_count}
            color="rose"
          >
            {data.pending.unpublish_requests.length > 0 ? (
              <div className="space-y-4">
                {data.pending.unpublish_requests.slice(0, 3).map((req) => (
                  <Link href={`/admin/events`} key={req.id} className="block">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                            {req.event?.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-medium">
                            By {req.event?.ngo?.name}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-rose-600 transition-colors" />
                    </div>
                  </Link>
                ))}
                {data.pending.unpublish_count > 3 && (
                  <Link
                    href="/admin/events"
                    className="block text-center text-xs font-bold text-gray-500 hover:text-rose-600 py-2 transition-colors"
                  >
                    See more ({data.pending.unpublish_count - 3} more)
                  </Link>
                )}
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-rose-200 mx-auto" />
                <p className="text-xs text-gray-400 font-medium">
                  No pending requests
                </p>
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Status Modal for Login Success */}
      <StatusModal
        isOpen={showLoginSuccess}
        onClose={() => setShowLoginSuccess(false)}
        type="success"
        title="Admin Authorized"
        message="Welcome back, Commander. The platform data is synchronized."
        confirmText="Open Dashboard"
      />
    </div>
  );
};

const NgoListSection = () => {
  const [ngos, setNgos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/ngos?search=${search}&page=${page}&per_page=5&status=approved`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const result = await response.json();
        setNgos(result.data);
        setMeta(result.meta);
      } catch (err) {
        console.error("Failed to fetch NGOs", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchNgos, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <Section title="Registered NGOs">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search NGOs by name or registration number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-50 rounded-2xl animate-pulse"
              />
            ))
          ) : ngos.length > 0 ? (
            ngos.map((ngo) => (
              <div
                key={ngo.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {ngo.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{ngo.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {ngo.registration_no} &bull; {ngo.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">
                    Funds Raised
                  </p>
                  <p className="text-lg font-black text-emerald-600">
                    RM {(ngo.total_funds_raised / 100 || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400">
              No registered NGOs found matching your search.
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <span className="text-sm font-bold text-gray-600">
              Page {page} of {meta.last_page}
            </span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
};

const EventAnalyticsSection = ({ data: initialData }) => {
  const [data, setData] = useState(initialData || []);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip initial fetch if we have initialData and no filters changed (handled by initial state)
    // But if filters change, we fetch.
    if (month === "" && year === new Date().getFullYear() && initialData) {
      setData(initialData);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/dashboard/analytics?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300); // Debounce
    return () => clearTimeout(timer);
  }, [month, year]);

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text("Event Analytics Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(
      `Filter: Year ${year} ${month ? `| Month: ${month}` : "| All Months"}`,
      14,
      27
    );

    const tableColumn = [
      "Event Name",
      "Date",
      "Participants",
      "Volunteers",
      "Donors",
    ];
    const tableRows = [];

    data.forEach((event) => {
      const eventData = [
        event.full_name,
        event.date,
        event.participants,
        event.volunteers,
        event.donors,
      ];
      tableRows.push(eventData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 32,
    });

    doc.save(`event_analytics_report_${year}_${month || "all"}.pdf`);
  };

  const months = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const totals = data.reduce(
    (acc, curr) => ({
      participants: acc.participants + curr.participants,
      volunteers: acc.volunteers + curr.volunteers,
      donors: acc.donors + curr.donors,
    }),
    { participants: 0, volunteers: 0, donors: 0 }
  );

  return (
    <Section title="Event Analytics">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={downloadReport}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <ArrowDownRight className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">
            Total Participants
          </p>
          <p className="text-2xl font-black text-emerald-700">
            {totals.participants.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
          <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">
            Total Volunteers
          </p>
          <p className="text-2xl font-black text-purple-700">
            {totals.volunteers.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">
            Total Donors
          </p>
          <p className="text-2xl font-black text-rose-700">
            {totals.donors.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-[350px] w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6B7280" }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6B7280" }}
            />
            <Tooltip
              cursor={{ fill: "#F9FAFB" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="participants"
              name="Participants"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="volunteers"
              name="Volunteers"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="donors"
              name="Donors"
              fill="#F43F5E"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
};

const StatsCard = ({ stat }) => {
  const icons = {
    users: Users,
    building: Building,
    heart: Heart,
    calendar: Calendar,
  };
  const Icon = icons[stat.icon] || Users;

  const colorConfig = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
      }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative group overflow-hidden"
    >
      <div
        className={`p-4 rounded-3xl ${
          colorConfig[stat.color]
        } border w-fit mb-6 transition-transform group-hover:rotate-12`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-widest">
          {stat.label}
        </p>
        <h3 className="text-3xl font-black text-gray-900 mb-2">{stat.value}</h3>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-emerald-600 font-black text-xs">
            <ArrowUpRight className="h-3 w-3" />
            <span>{stat.change}</span>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-20 w-20" />
      </div>
    </motion.div>
  );
};

const Section = ({ title, badge, color, children }) => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
        {badge > 0 && (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black ${
              color === "rose"
                ? "bg-rose-100 text-rose-600"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {badge} PENDING
          </span>
        )}
      </div>
      <button className="p-2 hover:bg-gray-50 rounded-xl transition-all">
        <Filter className="h-5 w-5 text-gray-400" />
      </button>
    </div>
    {children}
  </div>
);

const NgoPerformanceSection = ({ data: initialData }) => {
  const [data, setData] = useState(initialData || []);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Similar logic: Fetch if filters change.
    if (
      month === "" &&
      year === new Date().getFullYear() &&
      initialData.length > 0
    ) {
      // Optional: Skip fetch if initialData is provided and filters are default
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/dashboard/ngo-performance?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch ngo performance", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text("NGO Performance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(
      `Filter: Year ${year} ${month ? `| Month: ${month}` : "| All Months"}`,
      14,
      27
    );

    const tableColumn = [
      "NGO Name",
      "Participants",
      "Volunteers",
      "Funds Raised (RM)",
    ];
    const tableRows = [];

    data.forEach((item) => {
      const rowData = [
        item.full_name,
        item.participants,
        item.volunteers,
        item.total_raised.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        }),
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 32,
    });

    doc.save(`ngo_performance_report_${year}_${month || "all"}.pdf`);
  };

  const months = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <Section title="NGO Performance Comparison">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={downloadReport}
          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <ArrowDownRight className="h-4 w-4" />
          Download Report
        </button>
      </div>

      <div className="h-[400px] w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={0}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6B7280" }}
              interval={0}
            />
            {/* Left Axis for People Counts */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#10B981"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#10B981" }}
              label={{
                value: "People",
                angle: -90,
                position: "insideLeft",
                fill: "#10B981",
                fontSize: 10,
              }}
            />
            {/* Right Axis for Money */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#F43F5E"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#F43F5E" }}
              tickFormatter={(val) => `RM${val / 1000}k`}
              label={{
                value: "Funds",
                angle: 90,
                position: "insideRight",
                fill: "#F43F5E",
                fontSize: 10,
              }}
            />
            <Tooltip
              cursor={{ fill: "#F9FAFB" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => {
                if (name === "Total Funds")
                  return `RM ${value.toLocaleString()}`;
                return value;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />

            <Bar
              yAxisId="left"
              dataKey="participants"
              name="Participants"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="left"
              dataKey="volunteers"
              name="Volunteers"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="right"
              dataKey="total_raised"
              name="Total Funds"
              fill="#F43F5E"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
};

const EventDistributionSection = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          }/api/admin/dashboard/event-distribution?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch distribution", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  const COLORS = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
  ];

  const months = [
    { value: "", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <Section title="State Contribution (Participants + Volunteers)">
      <div className="flex items-center justify-end gap-2 mb-6">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-[400px] w-full relative flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} people`, "Contribution"]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-xl font-bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`People: ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default AdminDashboardPage;
