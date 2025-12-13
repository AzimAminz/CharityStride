"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

/**
 * Search Bar Component with clear button
 * @param {Function} onSearch - Callback fired on search (debounced externally)
 * @param {String} placeholder - Input placeholder text
 * @param {String} value - Controlled input value
 */
export default function SearchBar({
  onSearch,
  placeholder = "Search...",
  value,
}) {
  const [localValue, setLocalValue] = useState(value || "");

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onSearch(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
      />

      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
