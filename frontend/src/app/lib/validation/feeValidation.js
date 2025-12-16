/**
 * Fee Validation Utilities
 * Handles cents-based input with RM display
 */

export function formatCentsInput(value) {
  // Remove all non-numeric characters
  return value.replace(/[^0-9]/g, "");
}

export function formatFeeDisplay(cents) {
  if (!cents) return "RM 0.00";
  const rm = (parseInt(cents) / 100).toFixed(2);
  return `RM ${rm}`;
}

export function getCentsHelperText(cents, language = "en") {
  const rm = formatFeeDisplay(cents);
  return language === "ms" ? `${cents} sen = ${rm}` : `${cents} cents = ${rm}`;
}

export function validateFee(cents, language = "en") {
  if (!cents) return null;

  const num = parseInt(cents);

  if (isNaN(num) || num < 0) {
    return language === "ms" ? "Jumlah tidak sah" : "Invalid amount";
  }

  return null;
}
