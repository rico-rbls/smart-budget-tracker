/**
 * Transaction Validation Utilities
 * Validates transaction data before processing
 */

/**
 * Validate transaction amount
 * @param {number} amount - Transaction amount
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateAmount = (amount) => {
  if (amount === undefined || amount === null) {
    return { valid: false, error: "Amount is required" };
  }

  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: "Amount must be a valid number" };
  }

  if (numAmount <= 0) {
    return { valid: false, error: "Amount must be a positive number" };
  }

  if (numAmount > 999999999.99) {
    return { valid: false, error: "Amount is too large" };
  }

  // Check for valid decimal places (max 2)
  const decimalPlaces = (numAmount.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    return { valid: false, error: "Amount can have at most 2 decimal places" };
  }

  return { valid: true, error: null };
};

/**
 * Validate transaction date
 * @param {string} date - Transaction date (YYYY-MM-DD)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateDate = (date) => {
  if (!date) {
    return { valid: false, error: "Date is required" };
  }

  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format" };
  }

  // Check if valid date
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: "Invalid date" };
  }

  // Check if date is not in the future
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  if (dateObj > today) {
    return { valid: false, error: "Date cannot be in the future" };
  }

  // Check if date is not too far in the past (e.g., 10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  if (dateObj < tenYearsAgo) {
    return { valid: false, error: "Date cannot be more than 10 years in the past" };
  }

  return { valid: true, error: null };
};

/**
 * Validate merchant name
 * @param {string} merchantName - Merchant name
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateMerchantName = (merchantName) => {
  if (!merchantName || merchantName.trim() === "") {
    return { valid: false, error: "Merchant name is required" };
  }

  if (merchantName.length > 255) {
    return { valid: false, error: "Merchant name is too long (max 255 characters)" };
  }

  return { valid: true, error: null };
};

/**
 * Validate payment method
 * @param {string} paymentMethod - Payment method
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePaymentMethod = (paymentMethod) => {
  if (!paymentMethod) {
    return { valid: true, error: null }; // Optional field
  }

  const validMethods = [
    "cash",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "paypal",
    "venmo",
    "apple_pay",
    "google_pay",
    "other",
  ];

  if (!validMethods.includes(paymentMethod.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid payment method. Must be one of: ${validMethods.join(", ")}`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate description
 * @param {string} description - Transaction description
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateDescription = (description) => {
  if (!description) {
    return { valid: true, error: null }; // Optional field
  }

  if (description.length > 1000) {
    return { valid: false, error: "Description is too long (max 1000 characters)" };
  }

  return { valid: true, error: null };
};

/**
 * Validate complete transaction data
 * @param {Object} transactionData - Transaction data object
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateTransaction = (transactionData) => {
  const errors = {};

  // Validate amount
  const amountValidation = validateAmount(transactionData.amount);
  if (!amountValidation.valid) {
    errors.amount = amountValidation.error;
  }

  // Validate date
  const dateValidation = validateDate(transactionData.transaction_date);
  if (!dateValidation.valid) {
    errors.transaction_date = dateValidation.error;
  }

  // Validate merchant name
  const merchantValidation = validateMerchantName(transactionData.merchant_name);
  if (!merchantValidation.valid) {
    errors.merchant_name = merchantValidation.error;
  }

  // Validate payment method (optional)
  if (transactionData.payment_method) {
    const paymentValidation = validatePaymentMethod(transactionData.payment_method);
    if (!paymentValidation.valid) {
      errors.payment_method = paymentValidation.error;
    }
  }

  // Validate description (optional)
  if (transactionData.description) {
    const descriptionValidation = validateDescription(transactionData.description);
    if (!descriptionValidation.valid) {
      errors.description = descriptionValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

