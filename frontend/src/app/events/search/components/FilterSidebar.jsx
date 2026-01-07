"use client";

import React from "react";
import { Filter as FilterIcon, X } from "lucide-react";

/**
 * FilterSidebar Component
 * Displays filters in a sidebar layout.
 *
 * @param {Object} filters - Current filter state
 * @param {Function} setFilters - Function to update filters
 * @param {boolean} isOpen - Mobile drawer open state
 * @param {Function} onClose - Close mobile drawer function
 * @param {Function} onApply - Apply filters function
 * @param {Function} onReset - Reset filters function
 */
const FilterSidebar = ({
  filters,
  setFilters,
  isOpen,
  onClose,
  onApply,
  onReset,
}) => {
  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category],
      },
    }));
  };

  const content = (
    <div className="flex flex-col h-full bg-white md:bg-transparent">
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FilterIcon className="w-5 h-5" />
          Filters
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-5 space-y-8 flex-1 overflow-y-auto">
        {/* Categories */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Categories
          </h3>
          <div className="space-y-3">
            {[
              { id: "volunteer", label: "Volunteer", color: "blue" },
              { id: "donation", label: "Donation", color: "green" },
              { id: "participant", label: "Participant", color: "orange" },
            ].map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories[cat.id]}
                    onChange={() => handleCategoryChange(cat.id)}
                    className="peer w-5 h-5 border-2 border-gray-300 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-colors checked:border-emerald-600 checked:bg-emerald-600"
                  />
                  <svg
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Apply / Reset Actions */}
        <div className="pt-6 border-t border-gray-100 space-y-3">
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
          >
            Apply Filters
          </button>
          <button
            onClick={onReset}
            className="w-full py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors text-sm hover:bg-gray-50 rounded-lg"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 sticky top-24 h-[calc(100vh-6rem)] pr-6 border-r border-gray-100">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
