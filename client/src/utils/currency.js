/**
 * Format amount as Philippine Peso currency
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showDecimals ? "₱0.00" : "₱0";
  }

  const numAmount = parseFloat(amount);

  if (showDecimals) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;

  // Remove currency symbol, commas, and spaces
  const cleaned = currencyString.replace(/[₱,\s]/g, "");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format amount with compact notation (e.g., ₱1.2K, ₱1.5M)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted compact currency string
 */
export const formatCompactCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₱0";
  }

  const numAmount = parseFloat(amount);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numAmount);
};

