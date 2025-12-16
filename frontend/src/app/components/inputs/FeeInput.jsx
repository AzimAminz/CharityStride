"use client";

export default function FeeInput({
  value, // in cents from backend (e.g., 2, 200, 3000)
  onChange,
  placeholder,
  className = "",
  error,
  language = "en",
  showHelper = true,
  ...props
}) {
  // Format cents to RM display (2 → "0.02", 200 → "2.00")
  const centsToRMDisplay = (cents) => {
    if (!cents || cents === "" || cents === "0") return "";
    const num = parseInt(cents);
    return (num / 100).toFixed(2);
  };

  const handleChange = (e) => {
    let input = e.target.value;

    // Remove all non-numeric characters
    let cleaned = input.replace(/[^0-9]/g, "");

    // Remove leading zeros unless it's just "0"
    if (cleaned.length > 1) {
      cleaned = cleaned.replace(/^0+/, "");
    }

    // Send cents value to parent
    onChange(cleaned || "0");
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const displayValue = centsToRMDisplay(value);

  const helperText =
    showHelper && value && value !== "0"
      ? language === "ms"
        ? `${value} sen = RM ${displayValue}`
        : `${value} cents = RM ${displayValue}`
      : "";

  return (
    <div className="w-full">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          RM
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder || "0.00"}
          className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-emerald-500"
          } ${className}`}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
