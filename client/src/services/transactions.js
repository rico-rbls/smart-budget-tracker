import { transactionsAPI } from "./api";

/**
 * Fetch transactions with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.start_date - Start date (YYYY-MM-DD)
 * @param {string} filters.end_date - End date (YYYY-MM-DD)
 * @param {number} filters.category_id - Category ID
 * @param {string} filters.merchant - Merchant name search
 * @param {string} filters.sort_by - Sort field (date, amount, merchant)
 * @param {string} filters.sort_order - Sort order (asc, desc)
 * @param {number} filters.limit - Number of results per page
 * @param {number} filters.offset - Offset for pagination
 * @returns {Promise} API response with transactions
 */
export const fetchTransactions = async (filters = {}) => {
  try {
    const response = await transactionsAPI.getAll(filters);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch transactions",
    };
  }
};

/**
 * Create a new transaction
 * @param {Object} data - Transaction data
 * @param {number} data.category_id - Category ID
 * @param {number} data.amount - Transaction amount
 * @param {string} data.merchant_name - Merchant name
 * @param {string} data.transaction_date - Transaction date (YYYY-MM-DD)
 * @param {string} data.payment_method - Payment method (optional)
 * @param {string} data.description - Description (optional)
 * @returns {Promise} API response with created transaction
 */
export const createTransaction = async (data) => {
  try {
    const response = await transactionsAPI.create(data);
    return {
      success: true,
      data: response.data.data,
      message: "Transaction created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to create transaction",
      errors: error.response?.data?.errors || [],
    };
  }
};

/**
 * Update an existing transaction
 * @param {number} id - Transaction ID
 * @param {Object} data - Updated transaction data
 * @returns {Promise} API response with updated transaction
 */
export const updateTransaction = async (id, data) => {
  try {
    const response = await transactionsAPI.update(id, data);
    return {
      success: true,
      data: response.data.data,
      message: "Transaction updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update transaction",
      errors: error.response?.data?.errors || [],
    };
  }
};

/**
 * Delete a transaction
 * @param {number} id - Transaction ID
 * @returns {Promise} API response
 */
export const deleteTransaction = async (id) => {
  try {
    await transactionsAPI.delete(id);
    return {
      success: true,
      message: "Transaction deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete transaction",
    };
  }
};

/**
 * Get transaction statistics
 * @param {Object} params - Query parameters
 * @param {string} params.period - Period (week, month, year)
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @returns {Promise} API response with statistics
 */
export const getTransactionStats = async (params = {}) => {
  try {
    const response = await transactionsAPI.getStats(params);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch statistics",
    };
  }
};

/**
 * Fetch categories for dropdown
 * @returns {Promise} API response with categories
 */
export const fetchCategories = async () => {
  try {
    // Using the transactions API to get categories from a transaction response
    // In a real app, you might have a separate categories endpoint
    const response = await transactionsAPI.getAll({ limit: 1 });
    return {
      success: true,
      data: response.data.data?.categories || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch categories",
      data: [],
    };
  }
};

