"use client";

import {
  validateDateNotPast,
  validateDateRange,
} from "../../lib/validation/dateValidation";
import React from "react";

export default function DateInput({
  value,
  onChange,
  disablePast = false,
  min,
  max,
  compareWith,
  compareType, // 'before' or 'after'
  language = "en",
  error: externalError,
  className = "",
  ...props
}) {
  const [internalError, setInternalError] = React.useState(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate
    let error = null;

    if (disablePast) {
      error = validateDateNotPast(newValue, language);
    }

    if (!error && compareWith && compareType === "before") {
      error = validateDateRange(newValue, compareWith, language);
    }

    if (!error && compareWith && compareType === "after") {
      error = validateDateRange(compareWith, newValue, language);
    }

    setInternalError(error);
  };

  const displayError = externalError || internalError;

  // Calculate min date if disablePast is true
  const minDate =
    disablePast && !min ? new Date().toISOString().split("T")[0] : min;

  return (
    <div className="w-full">
      <input
        type="date"
        value={value || ""}
        onChange={handleChange}
        min={minDate}
        max={max}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
          displayError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-emerald-500"
        } ${className}`}
        {...props}
      />
      {displayError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
}
