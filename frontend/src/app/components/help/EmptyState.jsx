"use client";

import { FileX, Plus } from "lucide-react";

/**
 * EmptyState - Shows friendly message when no data exists
 */
export default function EmptyState({
  icon: Icon = FileX,
  title,
  message,
  actionLabel,
  onAction,
  language = "en",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {message && (
        <p className="text-sm text-gray-600 text-center max-w-sm mb-6">
          {message}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
