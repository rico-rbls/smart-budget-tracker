import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * User Model
 * Handles all database operations related to users
 */
class UserModel {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @param {string} userData.name - User name
   * @returns {Promise<Object>} Created user object (without password)
   */
  static async create({ email, password, name }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, name) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, name, created_at`,
        [email, password_hash, name]
      );
      
      const user = userResult.rows[0];
      
      // Create default categories for the user
      await client.query('SELECT create_default_categories($1)', [user.id]);
      
      await client.query('COMMIT');
      
      return user;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }
  
  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object (without password) or null
   */
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  /**
   * Verify user password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} User object (without password) if valid, null otherwise
   */
  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Update user information
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user object
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'email'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updates[field])];
    
    const result = await pool.query(
      `UPDATE users 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, email, name, created_at, updated_at`,
      values
    );
    
    return result.rows[0];
  }
  
  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rowCount > 0;
  }
  
  /**
   * Get all users (admin function)
   * @returns {Promise<Array>} Array of users (without passwords)
   */
  static async findAll() {
    const result = await pool.query(
      'SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    return result.rows;
  }
}

export default UserModel;

