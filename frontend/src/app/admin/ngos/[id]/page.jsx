"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { getAdminNgoDetail, updateNgoStatus } from "../../../lib/admin";
import Loading from "../../../loading";
import NgoLocationMap from "../../../components/NgoLocationMap";
import StatusUpdateModal from "../components/StatusUpdateModal";

export default function NgoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [ngo, setNgo] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Fetch NGO details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getAdminNgoDetail(params.id);
        setNgo(data.ngo);
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching NGO details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDetails();
    }
  }, [params.id]);

  // Open modal with selected status
  const openStatusModal = (newStatus) => {
    setPendingStatus(newStatus);
    setModalOpen(true);
  };

  // Confirm status update
  const confirmStatusUpdate = async () => {
    setUpdating(true);
    try {
      await updateNgoStatus(ngo.id, pendingStatus);
      setNgo({ ...ngo, status: pendingStatus });
      setModalOpen(false);
      setPendingStatus(null);

      // Redirect back to admin NGOs page
      setTimeout(() => {
        router.push("/admin/ngos");
      }, 500);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!ngo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">NGO not found</p>
      </div>
    );
  }

  // Status badge colors
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    blocked: "bg-gray-100 text-gray-800",
  };

  // Formatted date
  const submittedDate = new Date(ngo.created_at).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to NGOs</span>
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{ngo.name}</h1>
            <p className="text-gray-500 mt-1">Submitted on {submittedDate}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[ngo.status]
              }`}
            >
              {ngo.status.charAt(0).toUpperCase() + ngo.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Registration Number
                  </label>
                  <p className="font-mono text-gray-900 mt-1">
                    {ngo.registration_no}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Registration Type
                  </label>
                  <p className="text-gray-900 mt-1">{ngo.registration_type}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Category
                  </label>
                  <p className="text-gray-900 mt-1">{ngo.category}</p>
                </div>

                {ngo.established_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Established Date
                    </label>
                    <p className="text-gray-900 mt-1">
                      {new Date(ngo.established_date).toLocaleDateString(
                        "en-MY"
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-gray-700 mt-2 leading-relaxed">
                  {ngo.description}
                </p>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                Contact Information
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a
                    href={`mailto:${ngo.contact_email}`}
                    className="text-emerald-600 hover:underline"
                  >
                    {ngo.contact_email}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a
                    href={`tel:${ngo.contact_phone}`}
                    className="text-gray-900"
                  >
                    {ngo.contact_phone}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Address & Location
              </h2>

              <p className="text-gray-700 mb-2">{ngo.address}</p>
              <p className="text-gray-700 mb-4">
                {ngo.postcode} {ngo.city}, {ngo.state}
              </p>

              {/* Map */}
              <div className="mb-4">
                <NgoLocationMap
                  latitude={parseFloat(ngo.latitude)}
                  longitude={parseFloat(ngo.longitude)}
                  name={ngo.name}
                />
              </div>

              <p className="text-sm text-gray-500">
                Coordinates: {ngo.latitude}, {ngo.longitude}
              </p>
            </motion.div>

            {/* Banking Details */}
            {ngo.bank_name && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Banking Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Bank Name
                    </label>
                    <p className="text-gray-900 mt-1">{ngo.bank_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Account Number
                    </label>
                    <p className="font-mono text-gray-900 mt-1">
                      {ngo.bank_account_no}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Account Name
                    </label>
                    <p className="text-gray-900 mt-1">
                      {ngo.bank_account_name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Documents
              </h2>

              <div className="space-y-4">
                {/* Logo */}
                {ngo.logo_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Logo
                    </label>
                    <img
                      src={ngo.logo_url}
                      alt="NGO Logo"
                      className="h-24 w-24 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Registration Document */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Registration Document
                  </label>
                  <a
                    href={ngo.registration_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Owner Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Owner Information
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-gray-900 mt-1">{user?.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900 mt-1">{user?.email}</p>
                </div>

                {user?.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="text-gray-900 mt-1">{user.phone}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            {ngo.status !== "rejected" && ngo.status !== "blocked" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Actions
                </h2>

                <div className="space-y-3">
                  {ngo.status !== "approved" && (
                    <button
                      onClick={() => openStatusModal("approved")}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      {updating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Approve
                        </>
                      )}
                    </button>
                  )}

                  {ngo.status !== "rejected" && ngo.status !== "approved" && (
                    <button
                      onClick={() => openStatusModal("rejected")}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      {updating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-5 w-5" />
                          Reject
                        </>
                      )}
                    </button>
                  )}

                  {ngo.status !== "blocked" && (
                    <button
                      onClick={() => openStatusModal("blocked")}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      {updating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Ban className="h-5 w-5" />
                          Block
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        status={pendingStatus}
        ngoName={ngo?.name}
        loading={updating}
      />
    </div>
  );
}
