"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

const StateDropdown = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Malaysian states
  const states = [
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

  const selectedState = states.find((state) => state.value === value);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (stateValue) => {
    onChange(stateValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className="flex-1 text-left text-gray-900">
          {selectedState?.label || "Select State"}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
          {states.map((state) => (
            <button
              key={state.value}
              type="button"
              onClick={() => handleSelect(state.value)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                value === state.value
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700"
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StateDropdown;
