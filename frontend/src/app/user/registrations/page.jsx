"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Layout from "@/app/components/Layout";
import {
  Users,
  Heart,
  UserCheck,
  Calendar,
  MapPin,
  QrCode,
  Shirt,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Receipt,
  Download,
  AlertCircle,
} from "lucide-react";
import { getUserRegistrations } from "../../lib/events";
import { api } from "../../lib/api";
import { previewReceipt, downloadReceipt } from "../../lib/receiptGenerator";

const RegistrationsPage = () => {
  const [activeTab, setActiveTab] = useState("participant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    participant_registrations: [],
    volunteer_registrations: [],
    donation_registrations: [],
    payments: [],
  });
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserRegistrations();
        setData(res);
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setError("Failed to load your registrations.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePreviewReceipt = (payment) => {
    if (payment.payable) {
      previewReceipt(payment.payable, payment);
    } else {
      console.error("No payable data found in payment");
      alert("Unable to generate receipt: Missing registration data");
    }
  };

  const tabs = [
    {
      id: "participant",
      label: "Participant",
      icon: Users,
      count: data.participant_registrations?.length || 0,
    },
    {
      id: "volunteer",
      label: "Volunteer",
      icon: UserCheck,
      count: data.volunteer_registrations?.length || 0,
    },
    {
      id: "donations",
      label: "Donations",
      icon: Heart,
      count: data.donation_registrations?.length || 0,
    },
    {
      id: "payments",
      label: "Payments",
      icon: Receipt,
      count: data.payments?.length || 0,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Registrations
            </h1>
            <p className="text-gray-600">
              View and manage all your event registrations
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[140px] px-6 py-4 flex items-center justify-center gap-3 border-b-2 transition-all ${
                      activeTab === tab.id
                        ? "border-emerald-600 text-emerald-600 bg-emerald-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === tab.id
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Participant Tab */}
              {activeTab === "participant" && (
                <>
                  {data.participant_registrations?.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Participant Registrations
                      </h3>
                      <p className="text-gray-600">
                        You haven't registered for any events yet.
                      </p>
                    </div>
                  ) : (
                    data.participant_registrations?.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {reg.event?.title || "Event"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {reg.participant_category?.category_name}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reg.attendance_status === "checked_in"
                                ? "bg-green-100 text-green-700"
                                : reg.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : reg.status === "pending_payment"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {reg.status === "confirmed" ? (
                              <CheckCircle2 className="inline h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="inline h-3 w-3 mr-1" />
                            )}
                            {reg.status?.replace("_", " ").toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {reg.participant_category?.has_bib && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                BIB Number
                              </p>
                              <p className="font-semibold text-gray-900">
                                {reg.bib_number || "Pending"}
                              </p>
                            </div>
                          )}
                          {reg.event && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Event Date
                              </p>
                              <p className="font-medium text-gray-900">
                                {new Date(
                                  reg.event.start_date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Fee</p>
                            <p className="font-medium text-gray-900">
                              {reg.payments && reg.payments.length > 0
                                ? `RM ${(reg.payments[0].amount / 100).toFixed(
                                    2
                                  )}`
                                : reg.amount_paid > 0
                                ? `RM ${(reg.amount_paid / 100).toFixed(2)}`
                                : "Free"}
                            </p>
                          </div>
                          {reg.tshirt_size && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                T-Shirt
                              </p>
                              <p className="font-medium text-gray-900">
                                {reg.tshirt_size}{" "}
                                {reg.tshirt_collected && (
                                  <Shirt className="inline h-4 w-4 text-green-600 ml-1" />
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {reg.event?.location || "Location TBA"}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              reg.qr_code &&
                              setSelectedQR({
                                qr_code: reg.qr_code,
                                event_title: reg.event?.title,
                                bib_number: reg.bib_number,
                                has_bib: reg.participant_category?.has_bib,
                                category:
                                  reg.participant_category?.category_name,
                              })
                            }
                            disabled={
                              !reg.qr_code || reg.status !== "confirmed"
                            }
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <QrCode className="h-4 w-4" />
                            View QR Code
                          </button>
                          {reg.status === "pending_payment" &&
                            reg.payments &&
                            reg.payments[0] &&
                            reg.payments[0].payment_status === "pending" && (
                              <a
                                href={`/payment/mock/${reg.payments[0].id}`}
                                className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2"
                              >
                                <Receipt className="h-4 w-4" />
                                Pay Now
                              </a>
                            )}
                          <a
                            href={`/events/${reg.event_id}`}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Event Details
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Volunteer Tab */}
              {activeTab === "volunteer" && (
                <>
                  {data.volunteer_registrations?.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                      <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Volunteer Registrations
                      </h3>
                      <p className="text-gray-600">
                        You haven't registered as a volunteer yet.
                      </p>
                    </div>
                  ) : (
                    data.volunteer_registrations?.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {reg.event?.title || "Event"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {reg.volunteer_role?.custom_role_name ||
                                "Volunteer"}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reg.attendance_status === "checked_in"
                                ? "bg-green-100 text-green-700"
                                : reg.status === "approved"
                                ? "bg-blue-100 text-blue-700"
                                : reg.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {reg.status === "approved" ? (
                              <CheckCircle2 className="inline h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="inline h-3 w-3 mr-1" />
                            )}
                            {reg.status?.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Shift Date
                            </p>
                            <p className="font-semibold text-gray-900">
                              {reg.volunteer_shift?.shift_date
                                ? new Date(
                                    reg.volunteer_shift.shift_date
                                  ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "TBA"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Shift Time
                            </p>
                            <p className="font-semibold text-gray-900">
                              {reg.volunteer_shift?.start_time &&
                              reg.volunteer_shift?.end_time
                                ? `${new Date(
                                    "2000-01-01 " +
                                      reg.volunteer_shift.start_time
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })} - ${new Date(
                                    "2000-01-01 " + reg.volunteer_shift.end_time
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}`
                                : "TBA"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Event Date
                            </p>
                            <p className="font-semibold text-gray-900">
                              {new Date(
                                reg.event?.start_date
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Attendance
                            </p>
                            <p className="font-semibold text-gray-900">
                              {reg.attendance_status === "checked_in" ? (
                                <span className="text-green-600">
                                  ✓ Checked In
                                </span>
                              ) : (
                                <span className="text-gray-600">Pending</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              reg.qr_code &&
                              setSelectedQR({
                                qr_code: reg.qr_code,
                                event_title: reg.event?.title,
                                role: reg.volunteer_role?.custom_role_name,
                                shift: `${reg.volunteer_shift?.shift_date} ${reg.volunteer_shift?.start_time}`,
                              })
                            }
                            disabled={!reg.qr_code || reg.status !== "approved"}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <QrCode className="h-4 w-4" />
                            View QR Code
                          </button>
                          <a
                            href={`/events/${reg.event_id}`}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Event Details
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Donations Tab */}
              {activeTab === "donations" && (
                <>
                  {data.donation_registrations?.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                      <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Donation Records
                      </h3>
                      <p className="text-gray-600">
                        You haven't made any donations yet.
                      </p>
                    </div>
                  ) : (
                    data.donation_registrations?.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {reg.event?.title || "Event"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Monetary Donation
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                              reg.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {reg.status === "confirmed" ? (
                              <CheckCircle2 className="inline h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="inline h-3 w-3 mr-1" />
                            )}
                            {reg.status?.replace("_", " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="font-semibold text-gray-900">
                              RM {(reg.amount_paid / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {reg.status === "confirmed" &&
                            reg.payments &&
                            reg.payments[0] && (
                              <button
                                onClick={() =>
                                  previewReceipt(reg, reg.payments[0])
                                }
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download Receipt
                              </button>
                            )}
                          {reg.status === "pending_payment" &&
                            reg.payments &&
                            reg.payments[0] &&
                            reg.payments[0].payment_status === "pending" && (
                              <a
                                href={`/payment/mock/${reg.payments[0].id}`}
                                className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2"
                              >
                                <Receipt className="h-4 w-4" />
                                Pay Now
                              </a>
                            )}
                          <a
                            href={`/events/${reg.event_id}`}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Event Details
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <>
                  {data.payments?.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                      <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Payments
                      </h3>
                      <p className="text-gray-600">
                        You don't have any payment records yet.
                      </p>
                    </div>
                  ) : (
                    data.payments?.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Payment
                            </h3>
                            <p className="text-sm text-gray-600">
                              {payment.payment_reference}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                              payment.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {payment.payment_status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="font-semibold text-gray-900 text-lg">
                              RM {(payment.amount / 100).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(
                                payment.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Method</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {payment.payment_method || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {payment.payment_status}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {payment.payment_status === "pending" && (
                            <a
                              href={`/payment/mock/${payment.id}`}
                              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2 w-fit"
                            >
                              <Receipt className="h-4 w-4" />
                              Complete Payment
                            </a>
                          )}

                          {payment.payment_status === "paid" &&
                            payment.payable && (
                              <button
                                onClick={() => handlePreviewReceipt(payment)}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 w-fit"
                              >
                                <Download className="h-4 w-4" />
                                Preview & Download Receipt
                              </button>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedQR.event_title}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedQR.has_bib && selectedQR.bib_number
                  ? `${selectedQR.category} • BIB: ${selectedQR.bib_number}`
                  : selectedQR.role
                  ? `${selectedQR.role} • ${selectedQR.shift}`
                  : selectedQR.category || "Registration"}
              </p>

              <div className="bg-white p-6 rounded-xl border-4 border-emerald-500 inline-block mb-6">
                <QRCodeSVG
                  value={selectedQR.qr_code}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Show this QR code at the event for check-in
              </p>

              <button
                onClick={() => setSelectedQR(null)}
                className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RegistrationsPage;
