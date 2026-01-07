"use client";

import React from "react";
import Link from "next/link";
import { Filter as FilterIcon, ChevronLeft, Search } from "lucide-react";
import SearchBar from "../../components/SearchBar";

const SearchResultsHeader = ({
  searchQuery,
  totalResults,
  sort,
  setSort,
  location,
  onOpenFilters,
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumb & Mobile Back */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href="/events"
          className="hover:text-emerald-600 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Search Results</span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title & Count */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery ? (
                <>
                  Results for "
                  <span className="text-emerald-600">{searchQuery}</span>"
                </>
              ) : (
                "All Events"
              )}
            </h1>
            <p className="text-gray-500 font-medium">
              Found {totalResults} {totalResults === 1 ? "event" : "events"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFilters}
              className="md:hidden px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FilterIcon className="w-4 h-4" />
              Filters
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:border-gray-300 transition-colors text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="nearest">Nearest</option>
                <option value="popular">Popularity</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <SearchBar
            initialQuery={searchQuery || ""}
            initialLocation={location || "all"}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResultsHeader;
