"use client";

import {
  formatNumericInput,
  validatePositiveInteger,
} from "../../lib/validation/numberValidation";

export default function NumericInput({
  value,
  onChange,
  language = "en",
  error: externalError,
  className = "",
  ...props
}) {
  const handleChange = (e) => {
    const formatted = formatNumericInput(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        inputMode="numeric"
        value={value || ""}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
          externalError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-emerald-500"
        } ${className}`}
        {...props}
      />
      {externalError && (
        <p className="mt-1 text-sm text-red-600">{externalError}</p>
      )}
    </div>
  );
}
