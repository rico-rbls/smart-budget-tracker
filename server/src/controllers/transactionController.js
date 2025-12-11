import TransactionModel from "../models/Transaction.model.js";
import CategoryModel from "../models/Category.model.js";
import { validateTransaction } from "../utils/transactionValidation.js";
import pool from "../config/database.js";

/**
 * Create a new transaction
 * POST /api/transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      category_id,
      merchant_name,
      amount,
      transaction_date,
      description,
      payment_method,
    } = req.body;

    // Validate transaction data
    const validation = validateTransaction({
      merchant_name,
      amount,
      transaction_date,
      payment_method,
      description,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Verify category exists and belongs to user (if provided)
    if (category_id) {
      const category = await CategoryModel.findById(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      if (category.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to use this category",
        });
      }
    }

    // Create transaction
    const transaction = await TransactionModel.create({
      user_id: userId,
      receipt_id: null,
      category_id: category_id || null,
      merchant_name,
      amount: parseFloat(amount),
      transaction_date,
      description: description || null,
      payment_method: payment_method || null,
    });

    // Fetch the created transaction with category name
    const createdTransaction = await TransactionModel.findById(transaction.id);

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: {
        transaction: createdTransaction,
      },
    });
  } catch (err) {
    console.error("❌ Error creating transaction:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: err.message,
    });
  }
};

/**
 * Get all transactions with filters
 * GET /api/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      limit = 50,
      offset = 0,
      category_id,
      merchant_name,
      start_date,
      end_date,
      min_amount,
      max_amount,
      sort_by = "date",
      sort_order = "desc",
    } = req.query;

    // Build query
    let query = `
      SELECT t.*, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = $1
    `;

    const params = [userId];
    let paramCount = 2;

    // Apply filters
    if (category_id) {
      query += ` AND t.category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    if (merchant_name) {
      query += ` AND LOWER(t.merchant_name) LIKE LOWER($${paramCount})`;
      params.push(`%${merchant_name}%`);
      paramCount++;
    }

    if (start_date) {
      query += ` AND t.transaction_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND t.transaction_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (min_amount) {
      query += ` AND t.amount >= $${paramCount}`;
      params.push(parseFloat(min_amount));
      paramCount++;
    }

    if (max_amount) {
      query += ` AND t.amount <= $${paramCount}`;
      params.push(parseFloat(max_amount));
      paramCount++;
    }

    // Apply sorting
    const validSortFields = {
      date: "transaction_date",
      amount: "amount",
      merchant: "merchant_name",
    };
    const sortField = validSortFields[sort_by] || "transaction_date";
    const sortDirection = sort_order.toLowerCase() === "asc" ? "ASC" : "DESC";
    query += ` ORDER BY t.${sortField} ${sortDirection}`;

    // Apply pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    // Execute query
    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM transactions t WHERE t.user_id = $1`;
    const countParams = [userId];
    let countParamIndex = 2;

    if (category_id) {
      countQuery += ` AND t.category_id = $${countParamIndex}`;
      countParams.push(category_id);
      countParamIndex++;
    }

    if (merchant_name) {
      countQuery += ` AND LOWER(t.merchant_name) LIKE LOWER($${countParamIndex})`;
      countParams.push(`%${merchant_name}%`);
      countParamIndex++;
    }

    if (start_date) {
      countQuery += ` AND t.transaction_date >= $${countParamIndex}`;
      countParams.push(start_date);
      countParamIndex++;
    }

    if (end_date) {
      countQuery += ` AND t.transaction_date <= $${countParamIndex}`;
      countParams.push(end_date);
      countParamIndex++;
    }

    if (min_amount) {
      countQuery += ` AND t.amount >= $${countParamIndex}`;
      countParams.push(parseFloat(min_amount));
      countParamIndex++;
    }

    if (max_amount) {
      countQuery += ` AND t.amount <= $${countParamIndex}`;
      countParams.push(parseFloat(max_amount));
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        transactions: result.rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + result.rows.length < total,
        },
      },
    });
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: err.message,
    });
  }
};

/**
 * Get single transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify ownership
    if (transaction.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this transaction",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching transaction:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: err.message,
    });
  }
};

/**
 * Update transaction
 * PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      category_id,
      merchant_name,
      amount,
      transaction_date,
      description,
      payment_method,
    } = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await TransactionModel.findById(id);

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (existingTransaction.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this transaction",
      });
    }

    // Build updates object
    const updates = {};

    if (category_id !== undefined) {
      // Verify category exists and belongs to user
      if (category_id !== null) {
        const category = await CategoryModel.findById(category_id);
        if (!category) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
        if (category.user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to use this category",
          });
        }
      }
      updates.category_id = category_id;
    }

    if (merchant_name !== undefined) updates.merchant_name = merchant_name;
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (transaction_date !== undefined)
      updates.transaction_date = transaction_date;
    if (description !== undefined) updates.description = description;
    if (payment_method !== undefined) updates.payment_method = payment_method;

    // Validate updates
    if (Object.keys(updates).length > 0) {
      // Convert existing date to string format if needed
      const existingDate =
        existingTransaction.transaction_date instanceof Date
          ? existingTransaction.transaction_date.toISOString().split("T")[0]
          : existingTransaction.transaction_date;

      const validation = validateTransaction({
        merchant_name:
          updates.merchant_name || existingTransaction.merchant_name,
        amount: updates.amount || existingTransaction.amount,
        transaction_date: updates.transaction_date || existingDate,
        payment_method:
          updates.payment_method || existingTransaction.payment_method,
        description: updates.description || existingTransaction.description,
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }
    }

    // Update transaction
    const updatedTransaction = await TransactionModel.update(id, updates);

    // Fetch updated transaction with category name
    const transaction = await TransactionModel.findById(id);

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: {
        transaction,
      },
    });
  } catch (err) {
    console.error("❌ Error updating transaction:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: err.message,
    });
  }
};

/**
 * Delete transaction
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if transaction exists and belongs to user
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this transaction",
      });
    }

    // Delete transaction
    await TransactionModel.delete(id);

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting transaction:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: err.message,
    });
  }
};

/**
 * Get transaction statistics
 * GET /api/transactions/stats
 */
export const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = "month", start_date, end_date } = req.query;

    // Determine date range based on period
    let startDate, endDate;
    const now = new Date();

    if (start_date && end_date) {
      startDate = start_date;
      endDate = end_date;
    } else {
      switch (period) {
        case "week":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          );
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      endDate = now;
      startDate = startDate.toISOString().split("T")[0];
      endDate = endDate.toISOString().split("T")[0];
    }

    // Get total spending for current period
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3`,
      [userId, startDate, endDate]
    );
    const totalSpending = parseFloat(totalResult.rows[0].total);

    // Get spending by category
    const categoryResult = await pool.query(
      `SELECT c.id, c.name, c.color, c.icon, COALESCE(SUM(t.amount), 0) as total, COUNT(t.id) as count
       FROM categories c
       LEFT JOIN transactions t ON c.id = t.category_id
         AND t.user_id = $1
         AND t.transaction_date >= $2
         AND t.transaction_date <= $3
       WHERE c.user_id = $1
       GROUP BY c.id, c.name, c.color, c.icon
       ORDER BY total DESC`,
      [userId, startDate, endDate]
    );

    const spendingByCategory = categoryResult.rows.map((row) => ({
      category_id: row.id,
      category_name: row.name,
      color: row.color,
      icon: row.icon,
      total: parseFloat(row.total),
      count: parseInt(row.count),
      percentage:
        totalSpending > 0 ? (parseFloat(row.total) / totalSpending) * 100 : 0,
    }));

    // Get top 5 merchants
    const merchantResult = await pool.query(
      `SELECT merchant_name, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3
       GROUP BY merchant_name
       ORDER BY total DESC
       LIMIT 5`,
      [userId, startDate, endDate]
    );

    const topMerchants = merchantResult.rows.map((row) => ({
      merchant_name: row.merchant_name,
      total: parseFloat(row.total),
      count: parseInt(row.count),
    }));

    // Get daily spending trends
    const dailyResult = await pool.query(
      `SELECT transaction_date, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3
       GROUP BY transaction_date
       ORDER BY transaction_date ASC`,
      [userId, startDate, endDate]
    );

    const dailySpending = dailyResult.rows.map((row) => ({
      date: row.transaction_date,
      total: parseFloat(row.total),
      count: parseInt(row.count),
    }));

    // Calculate previous period for comparison
    const daysDiff = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);

    const prevTotalResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3`,
      [
        userId,
        prevStartDate.toISOString().split("T")[0],
        prevEndDate.toISOString().split("T")[0],
      ]
    );
    const prevTotalSpending = parseFloat(prevTotalResult.rows[0].total);

    // Calculate comparison
    const comparison = {
      previous_period_total: prevTotalSpending,
      change_amount: totalSpending - prevTotalSpending,
      change_percentage:
        prevTotalSpending > 0
          ? ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100
          : 0,
    };

    // Get transaction count
    const countResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM transactions
       WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date <= $3`,
      [userId, startDate, endDate]
    );
    const transactionCount = parseInt(countResult.rows[0].count);

    // Calculate average transaction amount
    const averageAmount =
      transactionCount > 0 ? totalSpending / transactionCount : 0;

    res.status(200).json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          type: period,
        },
        summary: {
          total_spending: totalSpending,
          transaction_count: transactionCount,
          average_amount: averageAmount,
        },
        spending_by_category: spendingByCategory,
        top_merchants: topMerchants,
        daily_spending: dailySpending,
        comparison,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching statistics:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: err.message,
    });
  }
};
