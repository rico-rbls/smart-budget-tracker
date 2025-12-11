/**
 * Budget Validation Utilities
 * Validates budget data before processing
 */

/**
 * Validate budget amount
 * @param {number} amount - Budget amount
 * @returns {Object} Validation result
 */
export const validateAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return { valid: false, error: "Amount is required" };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: "Amount must be a valid number" };
  }

  if (numAmount <= 0) {
    return { valid: false, error: "Amount must be greater than zero" };
  }

  if (numAmount > 999999999.99) {
    return { valid: false, error: "Amount is too large" };
  }

  // Check for max 2 decimal places
  const decimalPlaces = (numAmount.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    return {
      valid: false,
      error: "Amount can have at most 2 decimal places",
    };
  }

  return { valid: true };
};

/**
 * Validate budget period
 * @param {string} period - Budget period
 * @returns {Object} Validation result
 */
export const validatePeriod = (period) => {
  const validPeriods = ["weekly", "monthly", "yearly"];

  if (!period) {
    return { valid: true }; // Optional, defaults to 'monthly'
  }

  if (!validPeriods.includes(period.toLowerCase())) {
    return {
      valid: false,
      error: `Period must be one of: ${validPeriods.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Validate date format
 * @param {string} date - Date string
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateDate = (date, fieldName = "Date") => {
  if (!date) {
    return { valid: true }; // Optional field
  }

  // Check YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      valid: false,
      error: `${fieldName} must be in YYYY-MM-DD format`,
    };
  }

  // Check if valid date
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` };
  }

  return { valid: true };
};

/**
 * Validate date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: true }; // Optional fields
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return {
      valid: false,
      error: "End date must be after start date",
    };
  }

  return { valid: true };
};

/**
 * Validate complete budget data
 * @param {Object} budgetData - Budget data to validate
 * @returns {Object} Validation result with errors object
 */
export const validateBudget = (budgetData) => {
  const errors = {};

  // Validate amount
  const amountValidation = validateAmount(budgetData.amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error;
  }

  // Validate period
  const periodValidation = validatePeriod(budgetData.period);
  if (!periodValidation.valid) {
    errors.period = periodValidation.error;
  }

  // Validate start_date
  const startDateValidation = validateDate(
    budgetData.start_date,
    "Start date"
  );
  if (!startDateValidation.valid) {
    errors.start_date = startDateValidation.error;
  }

  // Validate end_date
  const endDateValidation = validateDate(budgetData.end_date, "End date");
  if (!endDateValidation.valid) {
    errors.end_date = endDateValidation.error;
  }

  // Validate date range
  const dateRangeValidation = validateDateRange(
    budgetData.start_date,
    budgetData.end_date
  );
  if (!dateRangeValidation.valid) {
    errors.date_range = dateRangeValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

