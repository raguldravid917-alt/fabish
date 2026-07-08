/**
 * Consistent price formatting for INR.
 * Replaces scattered `Rs. ${price.toLocaleString('en-IN')}.00 INR` patterns.
 *
 * @param {number} price - The price value
 * @param {object} options
 * @param {boolean} [options.showCurrency=true] - Whether to show "INR" suffix
 * @param {boolean} [options.showPrefix=true] - Whether to show "Rs." prefix
 * @returns {string} Formatted price string
 *
 * @example
 * formatPrice(91900)       // → "Rs. 91,900.00 INR"
 * formatPrice(91900, { showCurrency: false }) // → "Rs. 91,900.00"
 */
export const formatPrice = (price, { showCurrency = true, showPrefix = true } = {}) => {
  if (typeof price !== 'number' || isNaN(price)) return '';

  const formatted = price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const prefix = showPrefix ? 'Rs. ' : '';
  const suffix = showCurrency ? ' INR' : '';

  return `${prefix}${formatted}${suffix}`;
};

/**
 * Format price with compare price (strikethrough pattern).
 * Returns an object for flexible rendering.
 */
export const getPriceDisplay = (price, comparePrice) => ({
  current: formatPrice(price),
  original: comparePrice > price ? formatPrice(comparePrice) : null,
  hasDiscount: comparePrice > price,
  discountPercent: comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0,
});
