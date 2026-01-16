"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Clock,
  TrendingUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getSearchSuggestions } from "../../lib/api/publicEventsApi";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchHistory } from "../../hooks/useSearchHistory";

// All Malaysian states and federal territories
const locations = [
  { value: "all", label: "All Malaysia" },
  { value: "johor", label: "Johor" },
  { value: "kedah", label: "Kedah" },
  { value: "kelantan", label: "Kelantan" },
  { value: "melaka", label: "Melaka" },
  { value: "negeri-sembilan", label: "Negeri Sembilan" },
  { value: "pahang", label: "Pahang" },
  { value: "penang", label: "Penang" },
  { value: "perak", label: "Perak" },
  { value: "perlis", label: "Perlis" },
  { value: "sabah", label: "Sabah" },
  { value: "sarawak", label: "Sarawak" },
  { value: "selangor", label: "Selangor" },
  { value: "terengganu", label: "Terengganu" },
  { value: "kuala-lumpur", label: "Kuala Lumpur" },
  { value: "labuan", label: "Labuan" },
  { value: "putrajaya", label: "Putrajaya" },
];

const SearchBar = ({
  initialQuery = "",
  initialLocation = "all",
  placeholder = "Search Events, Categories, Location...",
  onFilterClick,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(
    locations.find((l) => l.value === initialLocation) || locations[0]
  );
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  const { history, addToHistory, removeFromHistory } = useSearchHistory();
  const debouncedQuery = useDebounce(query, 300);

  // Fetch recommendations on mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // For now, use popular searches as recommendations
        // TODO: Create dedicated recommendations API endpoint
        const results = await getSearchSuggestions("charity");
        setRecommendations(results.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []);

  // Fetch suggestions with debounced query and state filter
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        console.log(
          "Fetching suggestions for:",
          debouncedQuery,
          "State:",
          location.value
        );
        const results = await getSearchSuggestions(
          debouncedQuery,
          location.value
        );
        console.log("Suggestions received:", results);
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, location.value]);

  // Fetch suggestions when search bar is focused (even if empty)
  const handleFocus = () => {
    setShowDropdown(true);
    // If query is empty, fetch suggestions immediately
    if (query.length === 0) {
      const fetchInitialSuggestions = async () => {
        try {
          const results = await getSearchSuggestions("", location.value);
          setSuggestions(results);
        } catch (error) {
          console.error("Failed to fetch initial suggestions:", error);
        }
      };
      fetchInitialSuggestions();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === "") return;

    addToHistory(searchQuery);
    setShowDropdown(false);
    router.push(
      `/events/search?q=${encodeURIComponent(
        searchQuery
      )}&location=${encodeURIComponent(location.value)}`
    );
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0) {
        const allItems = [
          ...history.map((h) => ({ type: "history", value: h.query })),
          ...suggestions,
        ];
        if (allItems[selectedIndex]) {
          handleSearch(
            allItems[selectedIndex].value || allItems[selectedIndex].query
          );
        }
      } else {
        handleSearch(query);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const maxIndex = history.length + suggestions.length - 1;
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const maxIndex = history.length + suggestions.length - 1;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const searchValue = suggestion.value || suggestion.query;
    setQuery(searchValue);
    handleSearch(searchValue);
  };

  const handleClearQuery = () => {
    setQuery("");
    setShowDropdown(false);
  };

  const handleLocationSelect = (loc) => {
    console.log("Location selected:", loc);
    setLocation(loc);
    setShowLocationDropdown(false);
  };

  const shouldShowDropdown =
    showDropdown &&
    (query.length > 0 ||
      history.length > 0 ||
      recommendations.length > 0 ||
      suggestions.length > 0);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input with Location Dropdown - Mobile: Vertical Stack, Desktop: Horizontal */}
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg">
        {/* Search Input Section */}
        <div className="flex items-center flex-1 border-b md:border-b-0 md:border-r border-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
          {/* Search Icon */}
          <div className="pl-4 pr-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="flex-1 py-3 px-2 text-gray-700 placeholder-gray-400 focus:outline-none text-sm md:text-base bg-transparent"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClearQuery}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Location Dropdown Section */}
        <div className="relative rounded-b-lg md:rounded-r-lg md:rounded-bl-none">
          <button
            onClick={() => {
              console.log(
                "Location dropdown toggled, current state:",
                showLocationDropdown
              );
              setShowLocationDropdown(!showLocationDropdown);
            }}
            type="button"
            className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-3  transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-sm md:text-base">
                {location.label}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                showLocationDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Location Dropdown Menu - Full width on mobile, higher z-index */}
          {showLocationDropdown && (
            <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-full md:w-64 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto z-[60]">
              <div className="py-2">
                {locations.map((loc) => (
                  <button
                    key={loc.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationSelect(loc);
                    }}
                    type="button"
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm md:text-base ${
                      location.value === loc.value
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Button */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            type="button"
            className="px-4 py-3  transition-colors focus:outline-none border-l border-gray-200"
            title="Advanced Filters"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-[70]">
          {/* Search History */}
          {history.length > 0 && query.length === 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recent Searches
              </div>
              {history.map((item, index) => (
                <div
                  key={`history-${index}`}
                  className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedIndex === index ? "bg-gray-50" : ""
                  }`}
                  onClick={() => handleSuggestionClick(item)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{item.query}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.query);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations (when search is empty) */}
          {recommendations.length > 0 && query.length === 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recommended
              </div>
              {recommendations.map((item, index) => (
                <div
                  key={`rec-${index}`}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                    selectedIndex === history.length + index ? "bg-gray-50" : ""
                  }`}
                  onClick={() => handleSuggestionClick(item)}
                >
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-gray-700 font-medium">
                      {item.value}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {item.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results / Suggestions */}
          {suggestions.length > 0 && (
            <div
              className={`py-2 ${
                query.length === 0 && history.length > 0
                  ? "border-t border-gray-100"
                  : ""
              }`}
            >
              {/* Show section title based on query state */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {query.length === 0 ? "Suggested Events" : "Search Results"}
              </div>

              {loading && (
                <div className="px-4 py-3 text-center text-gray-500">
                  Searching...
                </div>
              )}
              {!loading &&
                suggestions.map((item, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                      selectedIndex === history.length + index
                        ? "bg-gray-50"
                        : ""
                    }`}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-700 font-medium">
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {item.type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query.length > 0 && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
