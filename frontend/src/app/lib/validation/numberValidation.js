/**
 * Number Validation Utilities
 */

export function formatNumericInput(value) {
  // Remove all non-numeric characters
  return value.replace(/[^0-9]/g, "");
}

export function validatePositiveInteger(value, language = "en") {
  if (!value) return null;

  const num = parseInt(value);

  if (isNaN(num)) {
    return language === "ms"
      ? "Sila masukkan nombor yang sah"
      : "Please enter a valid number";
  }

  if (num <= 0) {
    return language === "ms"
      ? "Mesti nombor positif"
      : "Must be a positive number";
  }

  return null;
}
