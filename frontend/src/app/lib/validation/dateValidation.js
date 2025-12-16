/**
 * Date Validation Utilities
 */

export function validateDateNotPast(dateString, language = "en") {
  if (!dateString) return null;

  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return language === "ms"
      ? "Tarikh lepas tidak dibenarkan"
      : "Past dates are not allowed";
  }

  return null;
}

export function validateDateRange(startDate, endDate, language = "en") {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return language === "ms"
      ? "Tarikh mula mesti sebelum tarikh tamat"
      : "Start date must be before end date";
  }

  return null;
}

export function formatDateForDisplay(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
