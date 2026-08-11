/**
 * Validation utilities for KrackDeal Admin forms and data entry.
 */

/**
 * Validates standard email address formats.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email.trim());
}

/**
 * Validates whether a given string is a proper URL slug (lowercase, alphanumeric and hyphens).
 * Example: "summer-sale-2026" -> true
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== "string") return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

/**
 * Validates discount percentage (must be between 1 and 100).
 */
export function isValidDiscount(percent) {
  const numericValue = Number(percent);
  return !isNaN(numericValue) && numericValue > 0 && numericValue <= 100;
}
