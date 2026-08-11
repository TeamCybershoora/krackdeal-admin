/**
 * Formatting utilities for KrackDeal Admin Portal.
 */

/**
 * Formats a numeric value into INR currency display.
 * Example: formatCurrency(2500) -> "₹2,500"
 */
export function formatCurrency(amount, includeSymbol = true) {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return includeSymbol ? "₹0" : "0";

  const formatted = numericAmount.toLocaleString("en-IN");
  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Formats a timestamp into a standard date string.
 * Example: formatDate("2026-08-11") -> "11 Aug 2026"
 */
export function formatDate(date, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!date) return "";
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleDateString("en-IN", options);
  } catch (error) {
    return "";
  }
}

/**
 * Formats a date with 12-hour time.
 * Example: formatDateTime("2026-08-11T17:30:00") -> "11 Aug 2026, 05:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return "";
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (error) {
    return "";
  }
}

/**
 * Converts large numbers into compact strings (e.g. 1.5k, 2.4L, 1.2Cr).
 */
export function formatCompactNumber(num) {
  const value = Number(num);
  if (isNaN(value)) return "0";

  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (value >= 100000) {
    return `${(value / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(value);
}
