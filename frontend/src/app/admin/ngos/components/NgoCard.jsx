"use client";

import { Eye, Calendar, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/**
 * NGO Card Component
 * Displays NGO summary in Kanban card format
 */
export default function NgoCard({ ngo }) {
  const router = useRouter();

  // Format date
  const formattedDate = new Date(ngo.created_at).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
    >
      {/* NGO Name */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {ngo.name}
      </h3>

      {/* Registration Number */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Building2 className="h-4 w-4" />
        <span className="font-mono">{ngo.registration_no}</span>
      </div>

      {/* Category */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
          {ngo.category}
        </span>
      </div>

      {/* Submitted Date */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Calendar className="h-3 w-3" />
        <span>Submitted {formattedDate}</span>
      </div>

      {/* View Button */}
      <button
        onClick={() => router.push(`/admin/ngos/${ngo.id}`)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Eye className="h-4 w-4" />
        View Details
      </button>
    </motion.div>
  );
}
