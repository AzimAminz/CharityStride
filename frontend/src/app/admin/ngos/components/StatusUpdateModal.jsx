"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Status Update Modal Component
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Confirm handler
 * @param {string} status - New status (approved/rejected/blocked)
 * @param {string} ngoName - NGO name for display
 * @param {boolean} loading - Loading state
 */
export default function StatusUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  status,
  ngoName,
  loading,
}) {
  if (!isOpen) return null;

  const statusConfig = {
    approved: {
      title: "Approve NGO Registration",
      color: "text-green-600",
      bgColor: "bg-green-600",
      message: "This NGO will be able to create events and receive donations.",
    },
    rejected: {
      title: "Reject NGO Registration",
      color: "text-red-600",
      bgColor: "bg-red-600",
      message: "This NGO will not be able to access the platform.",
    },
    blocked: {
      title: "Block NGO",
      color: "text-gray-600",
      bgColor: "bg-gray-600",
      message: "This NGO will be blocked from all platform activities.",
    },
  };

  const config = statusConfig[status];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className={`text-xl font-bold ${config.color}`}>
                  {config.title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to{" "}
                  <strong className={config.color}>{status}</strong>:
                </p>
                <p className="font-semibold text-gray-900 mb-4">{ngoName}</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {config.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 bg-gray-50">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 ${config.bgColor} hover:opacity-90 text-white font-semibold rounded-lg transition-opacity disabled:opacity-50`}
                >
                  {loading
                    ? "Processing..."
                    : `Confirm ${
                        status.charAt(0).toUpperCase() + status.slice(1)
                      }`}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
