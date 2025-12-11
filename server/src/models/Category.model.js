import pool from "../config/database.js";

/**
 * Category Model
 * Handles all database operations for categories
 */
class CategoryModel {
  /**
   * Find category by name for a specific user
   * @param {number} userId - User ID
   * @param {string} name - Category name
   * @returns {Promise<Object|null>} Category or null
   */
  static async findByName(userId, name) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, name, color, icon, created_at 
         FROM categories 
         WHERE user_id = $1 AND LOWER(name) = LOWER($2)`,
        [userId, name]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error finding category by name:", err);
      throw err;
    }
  }

  /**
   * Find category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object|null>} Category or null
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, name, color, icon, created_at 
         FROM categories 
         WHERE id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error finding category by ID:", err);
      throw err;
    }
  }

  /**
   * Find all categories for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of categories
   */
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        `SELECT id, user_id, name, color, icon, created_at 
         FROM categories 
         WHERE user_id = $1 
         ORDER BY name ASC`,
        [userId]
      );

      return result.rows;
    } catch (err) {
      console.error("Error finding categories by user:", err);
      throw err;
    }
  }

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  static async create({ user_id, name, color = null, icon = null }) {
    try {
      const result = await pool.query(
        `INSERT INTO categories (user_id, name, color, icon) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, user_id, name, color, icon, created_at`,
        [user_id, name, color, icon]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated category or null
   */
  static async update(id, updates) {
    try {
      const allowedFields = ["name", "color", "icon"];
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
        `UPDATE categories 
         SET ${fields.join(", ")} 
         WHERE id = $${paramCount} 
         RETURNING id, user_id, name, color, icon, created_at`,
        values
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  }

  /**
   * Delete category
   * @param {number} id - Category ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM categories WHERE id = $1 RETURNING id`,
        [id]
      );

      return result.rowCount > 0;
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  }
}

export default CategoryModel;

