import pool from "../config/database.js";

/**
 * Budget Model
 * Handles all database operations for budgets
 */
class BudgetModel {
  /**
   * Create a new budget
   * @param {Object} budgetData - Budget data
   * @returns {Promise<Object>} Created budget
   */
  static async create({
    user_id,
    category_id,
    amount,
    period = "monthly",
    start_date = null,
    end_date = null,
  }) {
    try {
      const result = await pool.query(
        `INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, user_id, category_id, amount, period, start_date, end_date, created_at, updated_at`,
        [user_id, category_id, amount, period, start_date, end_date]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Error creating budget:", err);
      throw err;
    }
  }

  /**
   * Find budget by ID
   * @param {number} id - Budget ID
   * @returns {Promise<Object|null>} Budget or null
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT b.*, c.name as category_name, c.color, c.icon 
         FROM budgets b 
         LEFT JOIN categories c ON b.category_id = c.id 
         WHERE b.id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error finding budget:", err);
      throw err;
    }
  }

  /**
   * Find all budgets for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of budgets
   */
  static async findByUserId(userId, options = {}) {
    try {
      const { period = null } = options;

      let query = `
        SELECT b.*, c.name as category_name, c.color, c.icon 
        FROM budgets b 
        LEFT JOIN categories c ON b.category_id = c.id 
        WHERE b.user_id = $1
      `;

      const params = [userId];

      if (period) {
        query += ` AND b.period = $2`;
        params.push(period);
      }

      query += ` ORDER BY b.created_at DESC`;

      const result = await pool.query(query, params);

      return result.rows;
    } catch (err) {
      console.error("Error finding budgets by user:", err);
      throw err;
    }
  }

  /**
   * Find budget by user and category
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @param {string} period - Budget period
   * @returns {Promise<Object|null>} Budget or null
   */
  static async findByUserAndCategory(userId, categoryId, period = "monthly") {
    try {
      const result = await pool.query(
        `SELECT b.*, c.name as category_name, c.color, c.icon 
         FROM budgets b 
         LEFT JOIN categories c ON b.category_id = c.id 
         WHERE b.user_id = $1 AND b.category_id = $2 AND b.period = $3`,
        [userId, categoryId, period]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error finding budget by user and category:", err);
      throw err;
    }
  }

  /**
   * Update budget
   * @param {number} id - Budget ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated budget or null
   */
  static async update(id, updates) {
    try {
      const allowedFields = ["amount", "period", "start_date", "end_date"];
      const fields = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (fields.length === 0) {
        return null;
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE budgets 
         SET ${fields.join(", ")}, updated_at = NOW() 
         WHERE id = $${paramCount} 
         RETURNING id, user_id, category_id, amount, period, start_date, end_date, created_at, updated_at`,
        values
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error updating budget:", err);
      throw err;
    }
  }

  /**
   * Delete budget
   * @param {number} id - Budget ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM budgets WHERE id = $1 RETURNING id`,
        [id]
      );

      return result.rowCount > 0;
    } catch (err) {
      console.error("Error deleting budget:", err);
      throw err;
    }
  }
}

export default BudgetModel;

