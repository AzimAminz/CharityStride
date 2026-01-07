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
} from "lucide-react";
import { api } from "../../lib/api";
import Loading from "@/app/loading";

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

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

  const handlePrint = () => {
    window.print();
  };

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

          {certificates.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Complete your first volunteer shift to receive your digital
                certificate of appreciation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Award className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                    {cert.event?.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {cert.volunteer_shift?.shift_date
                          ? formatDate(cert.volunteer_shift.shift_date)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{cert.total_hours} Hours Contributed</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    View Certificate
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden print:p-0 print:shadow-none print:rounded-none">
            {/* Modal Actions (Hidden on print) */}
            <div className="absolute top-6 right-6 flex items-center gap-3 z-10 print:hidden">
              <button
                onClick={handlePrint}
                className="p-3 bg-white/80 backdrop-blur rounded-full text-gray-700 hover:bg-white shadow-lg transition-all border border-gray-200"
                title="Print Certificate"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-3 bg-white/80 backdrop-blur rounded-full text-gray-700 hover:bg-white shadow-lg transition-all border border-gray-200"
                title="Close"
              >
                <AlertCircle className="h-5 w-5 rotate-45" />
              </button>
            </div>

            {/* Certificate Template */}
            <div className="p-1 pb-1">
              <div className="bg-[#f8fafc] p-6 sm:p-12 md:p-20 relative overflow-hidden border-[16px] border-double border-emerald-600/20 m-4 rounded-[1.5rem]">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 text-center">
                  {/* Branding */}
                  <div className="flex flex-col items-center gap-4 mb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-black text-2xl italic">
                          C
                        </span>
                      </div>
                      <span className="text-gray-900 font-extrabold tracking-tighter text-3xl">
                        CHARITY<span className="text-emerald-500">STRIDE</span>
                      </span>
                    </div>
                    <div className="h-px w-32 bg-emerald-200" />
                  </div>

                  {/* Main Content */}
                  <h2 className="text-emerald-600 font-serif italic text-2xl mb-8">
                    Certificate of Appreciation
                  </h2>

                  <p className="text-gray-500 text-lg mb-4">
                    THIS CERTIFICATE IS PROUDLY PRESENTED TO
                  </p>

                  <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 font-serif leading-tight">
                    {selectedCert.user?.full_name}
                  </h3>

                  <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
                    In recognition of your exceptional commitment and dedicated
                    volunteer service for the event{" "}
                    <span className="font-bold text-gray-900">
                      "{selectedCert.event?.title}"
                    </span>{" "}
                    organized by{" "}
                    <span className="font-bold text-gray-900">
                      {selectedCert.event?.ngo?.ngo_name}
                    </span>
                    .
                  </p>

                  {/* Shift Stats Row */}
                  <div className="grid grid-cols-2 max-w-lg mx-auto gap-8 border-y border-emerald-100 py-8 mb-16">
                    <div className="text-center">
                      <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mb-1">
                        Shift Date
                      </p>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedCert.volunteer_shift?.shift_date
                          ? formatDate(selectedCert.volunteer_shift.shift_date)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-center border-l border-emerald-100">
                      <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mb-1">
                        Time Contributed
                      </p>
                      <p className="text-gray-900 font-bold text-lg">
                        {selectedCert.total_hours} Full Hours
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-32 mt-12 pb-8">
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-px bg-gray-300 mb-4" />
                      <p className="font-bold text-gray-900">
                        CharityStride Team
                      </p>
                      <p className="text-xs text-gray-400">
                        Official Platform Recognition
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-px bg-gray-300 mb-4" />
                      <p className="font-bold text-gray-900">
                        {selectedCert.event?.ngo?.ngo_name}
                      </p>
                      <p className="text-xs text-gray-400">Project Organizer</p>
                    </div>
                  </div>

                  {/* Verification ID */}
                  <div className="mt-16 pt-8 border-t border-gray-100 opacity-50">
                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                      Certificate ID: CS-VOL-{selectedCert.id}-
                      {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed,
          .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            background: white !important;
          }
          .relative {
            box-shadow: none !important;
            border: none !important;
          }
          button {
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
