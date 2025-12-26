"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSearchSuggestions } from "../../lib/api/publicEventsApi";

const SearchBar = ({
  initialQuery = "",
  placeholder = "Search events, NGOs, or locations...",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await getSearchSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    router.push(`/events/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearch(suggestions[selectedIndex].text);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-5 py-3 pl-12 pr-12 rounded-full border-2 border-gray-200 bg-white focus:border-blue-500 focus:outline-none text-gray-700 placeholder-gray-400 shadow-lg transition-all"
        />

        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSearch(suggestion.text)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.text}
                </div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider ml-3">
                {suggestion.type}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center text-sm text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
};

export default SearchBar;
