"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import SearchBar from "./SearchBar";
import NgoCard from "./NgoCard";

/**
 * Status Column Component
 * Displays NGOs for one status with search and pagination
 */
export default function StatusColumn({
  title,
  status,
  data,
  loading,
  pagination,
  searchValue,
  onSearch,
  onPageChange,
  color = "gray",
}) {
  // Color variants for column headers
  const colors = {
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { current_page, last_page } = pagination;
    const pages = [];

    // Show max 5 pages
    let start = Math.max(1, current_page - 2);
    let end = Math.min(last_page, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl p-4">
      {/* Column Header */}
      <div className={`${colors[color]} px-4 py-2 rounded-lg mb-4`}>
        <h2 className="font-bold text-lg">{title}</h2>
        {pagination && (
          <p className="text-sm opacity-75">
            {pagination.total} {pagination.total === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar
          onSearch={onSearch}
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchValue}
        />
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No {title.toLowerCase()} NGOs found</p>
          </div>
        ) : (
          data.map((ngo) => <NgoCard key={ngo.id} ngo={ngo} />)
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                page === pagination.current_page
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
