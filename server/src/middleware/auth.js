import jwt from "jsonwebtoken";
import pool from "../config/database.js";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists in database
    const result = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    // Attach user info to request object
    req.user = result.rows[0];
    req.userId = decoded.userId;

    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    // Handle other errors
    console.error("Authentication error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
      req.userId = decoded.userId;
    }

    next();
  } catch (err) {
    // If token is invalid, just continue without user info
    next();
  }
};

/**
 * Generate JWT token for user
 * @param {number} userId - User ID
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

/**
 * Middleware to check if user owns the resource
 * Use after authenticateToken middleware
 */
export const checkResourceOwnership = (resourceUserIdField = "user_id") => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: "Resource user ID not found.",
      });
    }

    if (parseInt(resourceUserId) !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't have permission to access this resource.",
      });
    }

    next();
  };
};

export default authenticateToken;

