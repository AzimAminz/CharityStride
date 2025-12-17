"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

/**
 * HelpTooltip - Shows helpful information on hover/click
 */
export default function HelpTooltip({ content, language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-emerald-600 transition-colors"
        aria-label={language === "ms" ? "Bantuan" : "Help"}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 top-6 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
        </div>
      )}
    </div>
  );
}
