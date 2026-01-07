"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/app/components/Layout";
import {
  Award,
  Download,
  Printer,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Building2,
  AlertCircle,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import Loading from "@/app/loading";

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await api.get("/user/my-certificates");
        setCertificates(response.data.certificates || []);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
        setError("Failed to load certificates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const format12Hour = (timeStr) => {
    if (!timeStr) return "TBA";
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return timeStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter and Search Logic
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = cert.event?.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const certYear = cert.volunteer_shift?.shift_date
      ? new Date(cert.volunteer_shift.shift_date).getFullYear().toString()
      : null;
    const matchesYear = yearFilter === "All Years" || certYear === yearFilter;

    return matchesSearch && matchesYear;
  });

  // Calculate distinct years for the filter
  const years = [
    "All Years",
    ...new Set(
      certificates
        .map((cert) =>
          cert.volunteer_shift?.shift_date
            ? new Date(cert.volunteer_shift.shift_date).getFullYear().toString()
            : null
        )
        .filter(Boolean)
    ),
  ].sort((a, b) => b - a);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter]);

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Achievement Certificates
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Download and share your volunteer service certificates.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by event title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all shadow-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery || yearFilter !== "All Years"
                  ? "No matching certificates"
                  : "No certificates yet"}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery || yearFilter !== "All Years"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Complete your first volunteer shift to receive your digital certificate of appreciation."}
              </p>
              {(searchQuery || yearFilter !== "All Years") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setYearFilter("All Years");
                  }}
                  className="mt-6 text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {paginatedCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 cursor-pointer flex flex-col"
                    onClick={() => setSelectedCert(cert)}
                  >
                    {/* Card Image Area */}
                    <div className="relative h-40 bg-emerald-900 overflow-hidden">
                      {cert.event?.thumbnail ? (
                        <img
                          src={cert.event.thumbnail}
                          alt={cert.event.title}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-emerald-600 to-emerald-900 opacity-60" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                          <Award className="h-3 w-3" />
                          Certified
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-4 group-hover:text-emerald-600 transition-colors min-h-[3.5rem]">
                        {cert.event?.title}
                      </h3>

                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-2.5 text-sm text-gray-500">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {cert.volunteer_shift?.shift_date
                              ? formatDate(cert.volunteer_shift.shift_date)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-500">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {format12Hour(cert.volunteer_shift?.start_time)} -{" "}
                            {format12Hour(cert.volunteer_shift?.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-500">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="font-medium line-clamp-1">
                            {cert.event?.ngo?.name}
                          </span>
                        </div>
                      </div>

                      <button className="w-full py-3.5 bg-gray-50 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-xs">
                        View Certificate
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pb-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all bg-white shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-1 px-4">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                          currentPage === i + 1
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                            : "text-gray-500 hover:bg-white hover:text-emerald-600 border border-transparent hover:border-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-white hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all bg-white shadow-sm"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div
          id="certificate-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0"
          onClick={(e) => {
            if (e.target.id === "certificate-modal") setSelectedCert(null);
          }}
        >
          <div className="modal-content-container relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
            {/* Modal Actions (Hidden on print) */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-gray-50/50 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-gray-900">
                  Certificate Preview
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Printer className="h-4 w-4" />
                  Print A4
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  <X className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>

            {/* Certificate Template */}
            <div className="print-container p-1 pb-1">
              <div className="bg-[#f8fafc] p-6 sm:p-10 md:p-16 relative overflow-hidden border-[16px] border-double border-emerald-600/20 m-4 rounded-[1.5rem] print:m-0 print:border-[12px] print:h-[297mm] print:w-[210mm] print:flex print:flex-col print:justify-center">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 text-center">
                  {/* Branding */}
                  <div className="flex flex-col items-center gap-3 mb-10 print:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-black text-xl italic">
                          C
                        </span>
                      </div>
                      <span className="text-gray-900 font-extrabold tracking-tighter text-2xl">
                        CHARITY<span className="text-emerald-500">STRIDE</span>
                      </span>
                    </div>
                    <div className="h-px w-24 bg-emerald-200" />
                  </div>

                  {/* Main Content */}
                  <h2 className="text-emerald-600 font-serif italic text-xl mb-6 print:mb-4">
                    Certificate of Appreciation
                  </h2>

                  <p className="text-gray-500 text-sm mb-3">
                    THIS CERTIFICATE IS PROUDLY PRESENTED TO
                  </p>

                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 font-serif leading-tight print:text-5xl">
                    {selectedCert.user?.full_name || selectedCert.user?.name}
                  </h3>

                  <p className="text-gray-600 text-base max-w-lg mx-auto mb-10 leading-relaxed print:text-lg">
                    In recognition of your exceptional commitment and dedicated
                    volunteer service for the event{" "}
                    <span className="font-bold text-gray-900 capitalize">
                      "{selectedCert.event?.title}"
                    </span>{" "}
                    organized by{" "}
                    <span className="font-bold text-gray-900">
                      {selectedCert.event?.ngo?.name || "Official Organizer"}
                    </span>
                    .
                  </p>

                  {/* Shift Stats Row */}
                  <div className="grid grid-cols-2 max-w-sm mx-auto gap-6 border-y border-emerald-100 py-6 mb-12">
                    <div className="text-center">
                      <p className="text-emerald-600 font-bold uppercase tracking-widest text-[9px] mb-1">
                        Shift Date
                      </p>
                      <p className="text-gray-900 font-bold text-base">
                        {selectedCert.volunteer_shift?.shift_date
                          ? formatDate(selectedCert.volunteer_shift.shift_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-center border-l border-emerald-100">
                      <p className="text-emerald-600 font-bold uppercase tracking-widest text-[9px] mb-1">
                        Shift Time
                      </p>
                      <p className="text-gray-900 font-bold text-base">
                        {format12Hour(selectedCert.volunteer_shift?.start_time)}{" "}
                        - {format12Hour(selectedCert.volunteer_shift?.end_time)}
                      </p>
                    </div>
                  </div>

                  {/* Recognition/Signature Area */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-48 h-px bg-linear-to-r from-transparent via-emerald-200 to-transparent" />
                    <div className="text-center">
                      <p className="text-gray-900 font-black text-lg uppercase tracking-wider mb-0.5">
                        {selectedCert.event?.ngo?.name || "Official Organizer"}
                      </p>
                      <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.2em]">
                        Project Organizer & Verifier
                      </p>
                    </div>
                    <div className="text-center pt-2">
                      <p className="text-gray-400 font-medium text-[10px]">
                        Issued via CharityStride Achievement System
                      </p>
                    </div>
                  </div>

                  {/* Verification ID */}
                  <div className="mt-12 pt-6 border-t border-gray-100 opacity-50">
                    <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                      Certificate ID: CS-VOL-{selectedCert.id}-
                      {(selectedCert.event?.title || "CERT")
                        .substring(0, 3)
                        .toUpperCase()}
                      -{Math.random().toString(36).substr(2, 6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improved Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #certificate-modal,
          #certificate-modal * {
            visibility: visible;
          }
          #certificate-modal {
            position: absolute;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            background: white !important;
          }
          .modal-content-container {
            width: 100% !important;
            max-width: none !important;
            height: 100% !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          .absolute,
          .rounded-full {
            display: block !important;
            -webkit-print-color-adjust: exact !important;
          }
          button,
          .px-8.py-4.border-b {
            display: none !important;
          }
          nav,
          footer {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default CertificatesPage;
