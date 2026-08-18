/**
 * String manipulation helpers for KrackDeal Admin.
 */

/**
 * Extracts initials from a user or admin name.
 * Example: "Admin User" -> "AU"
 */
export function getInitials(name = "") {
  if (!name || typeof name !== "string") return "AD";

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AD";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  const firstChar = words[0][0];
  const lastChar = words[words.length - 1][0];
  return (firstChar + lastChar).toUpperCase();
}

/**
 * Generates clean URL slugs from titles or category names.
 * Example: "Electronics & Accessories" -> "electronics-accessories"
 */
export function slugify(text = "") {
  if (!text) return "";

  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates long strings to a specified maximum length with "...".
 */
export function truncateText(text = "", maxLength = 60) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Capitalizes each word in a string.
 */
export function capitalize(text = "") {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\b\w/g, char => char.toUpperCase());
}
