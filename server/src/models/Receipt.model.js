import pool from "../config/database.js";

/**
 * Receipt Model
 * Handles all database operations for receipts
 */
class ReceiptModel {
  /**
   * Create a new receipt
   * @param {Object} receiptData - Receipt data
   * @param {number} receiptData.user_id - User ID
   * @param {string} receiptData.image_url - Path to uploaded image
   * @param {string} receiptData.ocr_text - Extracted OCR text
   * @param {boolean} receiptData.processed - Processing status
   * @returns {Promise<Object>} Created receipt
   */
  static async create({ user_id, image_url, ocr_text = null, processed = false }) {
    try {
      const result = await pool.query(
        `INSERT INTO receipts (user_id, image_url, ocr_text, processed) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, user_id, image_url, upload_date, ocr_text, processed, created_at`,
        [user_id, image_url, ocr_text, processed]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Error creating receipt:", err);
      throw err;
    }
  }

  /**
   * Find receipt by ID
   * @param {number} id - Receipt ID
   * @returns {Promise<Object|null>} Receipt or null
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, image_url, upload_date, ocr_text, processed, created_at 
         FROM receipts 
         WHERE id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error finding receipt:", err);
      throw err;
    }
  }

  /**
   * Find all receipts for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Limit number of results
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.processedOnly - Only return processed receipts
   * @returns {Promise<Array>} Array of receipts
   */
  static async findByUserId(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, processedOnly = false } = options;

      let query = `
        SELECT id, user_id, image_url, upload_date, ocr_text, processed, created_at 
        FROM receipts 
        WHERE user_id = $1
      `;

      const params = [userId];

      if (processedOnly) {
        query += ` AND processed = true`;
      }

      query += ` ORDER BY upload_date DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      return result.rows;
    } catch (err) {
      console.error("Error finding receipts by user:", err);
      throw err;
    }
  }

  /**
   * Update receipt
   * @param {number} id - Receipt ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated receipt or null
   */
  static async update(id, updates) {
    try {
      const allowedFields = ["image_url", "ocr_text", "processed"];
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
        `UPDATE receipts 
         SET ${fields.join(", ")} 
         WHERE id = $${paramCount} 
         RETURNING id, user_id, image_url, upload_date, ocr_text, processed, created_at`,
        values
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error updating receipt:", err);
      throw err;
    }
  }

  /**
   * Delete receipt
   * @param {number} id - Receipt ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM receipts WHERE id = $1 RETURNING id`,
        [id]
      );

      return result.rowCount > 0;
    } catch (err) {
      console.error("Error deleting receipt:", err);
      throw err;
    }
  }

  /**
   * Get receipt count for user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Count of receipts
   */
  static async getCountByUserId(userId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM receipts WHERE user_id = $1`,
        [userId]
      );

      return parseInt(result.rows[0].count);
    } catch (err) {
      console.error("Error getting receipt count:", err);
      throw err;
    }
  }

  /**
   * Get unprocessed receipts for user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of unprocessed receipts
   */
  static async getUnprocessed(userId) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, image_url, upload_date, ocr_text, processed, created_at 
         FROM receipts 
         WHERE user_id = $1 AND processed = false 
         ORDER BY upload_date DESC`,
        [userId]
      );

      return result.rows;
    } catch (err) {
      console.error("Error getting unprocessed receipts:", err);
      throw err;
    }
  }
}

export default ReceiptModel;

