import BudgetModel from "../models/Budget.model.js";
import CategoryModel from "../models/Category.model.js";
import pool from "../config/database.js";
import { validateBudget } from "../utils/budgetValidation.js";

/**
 * Create a new budget
 * @route POST /api/budgets
 */
export const createBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      category_id,
      amount,
      period = "monthly",
      start_date,
      end_date,
    } = req.body;

    // Validate budget data
    const validation = validateBudget({
      amount,
      period,
      start_date,
      end_date,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Validate category_id is required
    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: { category_id: "Category is required" },
      });
    }

    // Check if category exists and belongs to user
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

    // Check if budget already exists for this category and period
    const existingBudget = await BudgetModel.findByUserAndCategory(
      userId,
      category_id,
      period
    );

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        message: `A ${period} budget already exists for this category`,
        data: { existing_budget_id: existingBudget.id },
      });
    }

    // Calculate default date range if not provided
    let finalStartDate = start_date;
    let finalEndDate = end_date;

    if (!start_date || !end_date) {
      const now = new Date();
      const dateRange = calculateDateRange(period, now);
      finalStartDate = finalStartDate || dateRange.start;
      finalEndDate = finalEndDate || dateRange.end;
    }

    // Create budget
    const budget = await BudgetModel.create({
      user_id: userId,
      category_id,
      amount,
      period,
      start_date: finalStartDate,
      end_date: finalEndDate,
    });

    // Fetch budget with category details
    const budgetWithCategory = await BudgetModel.findById(budget.id);

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: { budget: budgetWithCategory },
    });
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create budget",
      error: err.message,
    });
  }
};

/**
 * Get all budgets for the authenticated user
 * @route GET /api/budgets
 */
export const getBudgets = async (req, res) => {
  try {
    const userId = req.userId;
    const { period } = req.query;

    const budgets = await BudgetModel.findByUserId(userId, { period });

    res.status(200).json({
      success: true,
      data: {
        budgets,
        count: budgets.length,
      },
    });
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budgets",
      error: err.message,
    });
  }
};

/**
 * Get a single budget by ID
 * @route GET /api/budgets/:id
 */
export const getBudgetById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const budget = await BudgetModel.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Check ownership
    if (budget.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this budget",
      });
    }

    res.status(200).json({
      success: true,
      data: { budget },
    });
  } catch (err) {
    console.error("Error fetching budget:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget",
      error: err.message,
    });
  }
};

/**
 * Update a budget
 * @route PUT /api/budgets/:id
 */
export const updateBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount, period, start_date, end_date } = req.body;

    // Check if budget exists
    const existingBudget = await BudgetModel.findById(id);

    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Check ownership
    if (existingBudget.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this budget",
      });
    }

    // Build updates object
    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (period !== undefined) updates.period = period;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;

    // Validate updates
    if (Object.keys(updates).length > 0) {
      // Convert existing dates to string format if needed
      const existingStartDate =
        existingBudget.start_date instanceof Date
          ? existingBudget.start_date.toISOString().split("T")[0]
          : existingBudget.start_date;
      const existingEndDate =
        existingBudget.end_date instanceof Date
          ? existingBudget.end_date.toISOString().split("T")[0]
          : existingBudget.end_date;

      const validation = validateBudget({
        amount: updates.amount || existingBudget.amount,
        period: updates.period || existingBudget.period,
        start_date: updates.start_date || existingStartDate,
        end_date: updates.end_date || existingEndDate,
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }
    }

    // Update budget
    const updatedBudget = await BudgetModel.update(id, updates);

    // Fetch budget with category details
    const budgetWithCategory = await BudgetModel.findById(id);

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: { budget: budgetWithCategory },
    });
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update budget",
      error: err.message,
    });
  }
};

/**
 * Delete a budget
 * @route DELETE /api/budgets/:id
 */
export const deleteBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if budget exists
    const budget = await BudgetModel.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Check ownership
    if (budget.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this budget",
      });
    }

    // Delete budget
    await BudgetModel.delete(id);

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete budget",
      error: err.message,
    });
  }
};

/**
 * Get budget status (budget vs actual spending)
 * @route GET /api/budgets/status
 */
export const getBudgetStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = "monthly" } = req.query;

    // Get all budgets for the user with the specified period
    const budgets = await BudgetModel.findByUserId(userId, { period });

    if (budgets.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          budgets: [],
          summary: {
            total_budget: 0,
            total_spent: 0,
            total_remaining: 0,
            overall_percentage: 0,
          },
        },
      });
    }

    // Calculate spending for each budget
    const budgetStatuses = await Promise.all(
      budgets.map(async (budget) => {
        // Determine date range
        const now = new Date();
        let startDate, endDate;

        if (budget.start_date && budget.end_date) {
          startDate =
            budget.start_date instanceof Date
              ? budget.start_date.toISOString().split("T")[0]
              : budget.start_date;
          endDate =
            budget.end_date instanceof Date
              ? budget.end_date.toISOString().split("T")[0]
              : budget.end_date;
        } else {
          const dateRange = calculateDateRange(budget.period, now);
          startDate = dateRange.start;
          endDate = dateRange.end;
        }

        // Get total spending for this category in the period
        const spendingResult = await pool.query(
          `SELECT COALESCE(SUM(amount), 0) as total_spent, COUNT(*) as transaction_count
           FROM transactions
           WHERE user_id = $1
             AND category_id = $2
             AND transaction_date >= $3
             AND transaction_date <= $4`,
          [userId, budget.category_id, startDate, endDate]
        );

        const totalSpent = parseFloat(spendingResult.rows[0].total_spent);
        const transactionCount = parseInt(
          spendingResult.rows[0].transaction_count
        );
        const budgetAmount = parseFloat(budget.amount);
        const remaining = budgetAmount - totalSpent;
        const percentageUsed =
          budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

        // Determine status and alert level
        let status = "safe";
        let alertLevel = null;

        if (percentageUsed >= 120) {
          status = "critical";
          alertLevel = "critical";
        } else if (percentageUsed >= 100) {
          status = "exceeded";
          alertLevel = "alert";
        } else if (percentageUsed >= 80) {
          status = "warning";
          alertLevel = "warning";
        }

        return {
          budget_id: budget.id,
          category_id: budget.category_id,
          category_name: budget.category_name,
          color: budget.color,
          icon: budget.icon,
          period: budget.period,
          start_date: startDate,
          end_date: endDate,
          budget_amount: budgetAmount,
          spent_amount: totalSpent,
          remaining_amount: remaining,
          percentage_used: Math.round(percentageUsed * 100) / 100,
          transaction_count: transactionCount,
          status,
          alert_level: alertLevel,
        };
      })
    );

    // Calculate summary
    const totalBudget = budgetStatuses.reduce(
      (sum, b) => sum + b.budget_amount,
      0
    );
    const totalSpent = budgetStatuses.reduce(
      (sum, b) => sum + b.spent_amount,
      0
    );
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        budgets: budgetStatuses,
        summary: {
          total_budget: totalBudget,
          total_spent: totalSpent,
          total_remaining: totalRemaining,
          overall_percentage: Math.round(overallPercentage * 100) / 100,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching budget status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch budget status",
      error: err.message,
    });
  }
};

/**
 * Helper function to calculate date range based on period
 * @param {string} period - Budget period (weekly, monthly, yearly)
 * @param {Date} referenceDate - Reference date (usually current date)
 * @returns {Object} Object with start and end dates
 */
const calculateDateRange = (period, referenceDate = new Date()) => {
  const now = referenceDate;
  let startDate, endDate;

  switch (period.toLowerCase()) {
    case "weekly":
      // Start of current week (Sunday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);

      // End of current week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "yearly":
      // Start of current year
      startDate = new Date(now.getFullYear(), 0, 1);

      // End of current year
      endDate = new Date(now.getFullYear(), 11, 31);
      break;

    case "monthly":
    default:
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      // End of current month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
  }

  return {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };
};
