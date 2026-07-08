/**
 * Converts a string into a URL-safe slug.
 * Extracted from ProductCard.jsx and ProductListing.jsx to eliminate duplication.
 *
 * @param {string} text - The text to slugify
 * @returns {string} URL-safe slug
 *
 * @example
 * slugify("Aloe Vera Freshness Cream") // → "aloe-vera-freshness-cream"
 */
export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
