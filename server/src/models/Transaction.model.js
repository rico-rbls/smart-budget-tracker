import pool from "../config/database.js";

/**
 * Transaction Model
 * Handles all database operations for transactions
 */
class TransactionModel {
  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  static async create({
    user_id,
    receipt_id = null,
    category_id = null,
    merchant_name,
    amount,
    transaction_date,
    description = null,
    payment_method = null,
  }) {
    try {
      const result = await pool.query(
        `INSERT INTO transactions 
         (user_id, receipt_id, category_id, merchant_name, amount, transaction_date, description, payment_method) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, user_id, receipt_id, category_id, merchant_name, amount, 
                   transaction_date, description, payment_method, created_at, updated_at`,
        [
          user_id,
          receipt_id,
          category_id,
          merchant_name,
          amount,
          transaction_date,
          description,
          payment_method,
        ]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Error creating transaction:", err);
      throw err;
    }
  }

  /**
   * Find transaction by ID
   * @param {number} id - Transaction ID
   * @returns {Promise<Object|null>} Transaction or null
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT t.*, c.name as category_name 
         FROM transactions t 
         LEFT JOIN categories c ON t.category_id = c.id 
         WHERE t.id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error finding transaction:", err);
      throw err;
    }
  }

  /**
   * Find all transactions for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of transactions
   */
  static async findByUserId(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, categoryId = null, startDate = null, endDate = null } = options;

      let query = `
        SELECT t.*, c.name as category_name 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = $1
      `;

      const params = [userId];
      let paramCount = 2;

      if (categoryId) {
        query += ` AND t.category_id = $${paramCount}`;
        params.push(categoryId);
        paramCount++;
      }

      if (startDate) {
        query += ` AND t.transaction_date >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND t.transaction_date <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      query += ` ORDER BY t.transaction_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      return result.rows;
    } catch (err) {
      console.error("Error finding transactions by user:", err);
      throw err;
    }
  }

  /**
   * Update transaction
   * @param {number} id - Transaction ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated transaction or null
   */
  static async update(id, updates) {
    try {
      const allowedFields = [
        "category_id",
        "merchant_name",
        "amount",
        "transaction_date",
        "description",
        "payment_method",
      ];

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

      // Add updated_at
      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE transactions 
         SET ${fields.join(", ")} 
         WHERE id = $${paramCount} 
         RETURNING id, user_id, receipt_id, category_id, merchant_name, amount, 
                   transaction_date, description, payment_method, created_at, updated_at`,
        values
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error updating transaction:", err);
      throw err;
    }
  }

  /**
   * Delete transaction
   * @param {number} id - Transaction ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM transactions WHERE id = $1 RETURNING id`,
        [id]
      );

      return result.rowCount > 0;
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw err;
    }
  }
}

export default TransactionModel;

