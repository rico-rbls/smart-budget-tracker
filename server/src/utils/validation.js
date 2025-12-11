/**
 * Validation Utilities
 * Functions for validating user input
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== "string") {
    return {
      valid: false,
      errors: ["Password is required"],
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate user registration data
 * @param {Object} data - User registration data
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @param {string} data.name - User name (optional)
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateRegistration = (data) => {
  const errors = {};

  // Validate email
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Invalid email format";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors.join(". ");
    }
  }

  // Validate name (optional but if provided, check length)
  if (data.name && data.name.trim().length === 0) {
    errors.name = "Name cannot be empty";
  }

  if (data.name && data.name.length > 255) {
    errors.name = "Name is too long (maximum 255 characters)";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate user login data
 * @param {Object} data - User login data
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateLogin = (data) => {
  const errors = {};

  // Validate email
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Invalid email format";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize user input by trimming whitespace
 * @param {Object} data - Data object to sanitize
 * @param {string[]} fields - Fields to sanitize
 * @returns {Object} Sanitized data
 */
export const sanitizeInput = (data, fields) => {
  const sanitized = { ...data };

  fields.forEach((field) => {
    if (sanitized[field] && typeof sanitized[field] === "string") {
      sanitized[field] = sanitized[field].trim();
    }
  });

  return sanitized;
};

/**
 * Validate transaction amount
 * @param {number} amount - Transaction amount
 * @returns {Object} { valid: boolean, error: string }
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
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (numAmount > 9999999.99) {
    return { valid: false, error: "Amount is too large" };
  }

  return { valid: true };
};

export default {
  isValidEmail,
  validatePassword,
  validateRegistration,
  validateLogin,
  sanitizeInput,
  validateAmount,
};

