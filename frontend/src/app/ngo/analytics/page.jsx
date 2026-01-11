"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Echo from "../../lib/echo";
import Layout from "@/app/components/Layout";
import { api } from "../../lib/api";
import {
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
  ArrowDownRight,
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

  // WebSocket listener for new registrations (Organization-wide)
  React.useEffect(() => {
    if (!Echo) return;

    // Get user data from localStorage to get ngo_id
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);
    const ngoId = user?.ngo_id;
    if (!ngoId) return;

    const channel = Echo.channel(`ngo.${ngoId}`);

    channel.listen("registration.created", (data) => {
      console.log("Analytics refresh triggered by WebSocket:", data);

      // Refresh the entire analytics dataset to update charts and summary cards
      fetchData(range);
    });

    return () => {
      if (Echo && ngoId) {
        channel.stopListening("registration.created");
      }
    };
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

  const { stats } = data;

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

        {/* Event Analytics Section (Replacing old trends) */}
        <div className="mb-8">
          <EventAnalyticsSection />
        </div>

        {/* Dynamic Table Section */}
        <div className="mb-8">
          <EventPerformanceTableSection formatCurrency={formatCurrency} />
        </div>
      </div>
    </Layout>
  );
};

const EventPerformanceTableSection = ({ formatCurrency }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

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

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/ngo/analytics/events-table?page=${page}&search=${search}&year=${year}&month=${month}`
      );
      setData(response.data.data);
      setMeta(response.data); // Contains current_page, last_page, etc.
    } catch (err) {
      console.error("Failed to fetch table data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTableData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, year, month]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative group">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
          />
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Years</option>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl transition-all">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 font-semibold text-gray-600 text-sm">
                Event Name
              </th>
              <th className="pb-4 font-semibold text-gray-600 text-sm">
                Start Date
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
            {data.length > 0 ? (
              data.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td
                    className="py-4 text-sm font-medium text-gray-900 truncate max-w-[200px]"
                    title={event.full_name}
                  >
                    {event.full_name}
                  </td>
                  <td className="py-4 text-sm text-gray-500">
                    {event.start_date}
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
                              of {formatCurrency(event.donation_target_amount)}
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
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-400">
                  {!loading && "No events found matching your criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-gray-900">{meta.from}</span>{" "}
            to <span className="font-bold text-gray-900">{meta.to}</span> of{" "}
            <span className="font-bold text-gray-900">{meta.total}</span> events
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(meta.last_page)].map((_, idx) => {
                // Simple pagination logic: show first, last, and window around current
                const p = idx + 1;
                if (
                  p === 1 ||
                  p === meta.last_page ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        page === p
                          ? "bg-emerald-600 text-white shadow-emerald-500/30 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (
                  (p === page - 2 && p > 1) ||
                  (p === page + 2 && p < meta.last_page)
                ) {
                  return (
                    <span key={p} className="text-gray-400 text-sm">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === meta.last_page}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
      </div>
      <button className="p-2 hover:bg-gray-50 rounded-xl transition-all">
        <Filter className="h-5 w-5 text-gray-400" />
      </button>
    </div>
    {children}
  </div>
);

const EventAnalyticsSection = () => {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use api.get wrapper if it handles auth automatically, otherwise use fetch with token
        const response = await api.get(
          `/ngo/analytics/events?year=${year}&month=${month}`
        );
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

export default NGOAnalyticsPage;
