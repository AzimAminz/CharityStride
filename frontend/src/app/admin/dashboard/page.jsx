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
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import StatusModal from "@/app/components/StatusModal";

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
                {data.pending.ngos.map((ngo) => (
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
                {data.pending.events.map((event) => (
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
                {data.pending.unpublish_requests.map((req) => (
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

export default AdminDashboardPage;
