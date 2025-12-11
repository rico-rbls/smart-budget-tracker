import UserModel from "../models/User.model.js";
import { generateToken } from "../middleware/auth.js";
import {
  validateRegistration,
  validateLogin,
  sanitizeInput,
} from "../utils/validation.js";

/**
 * Authentication Controller
 * Handles user registration, login, and profile operations
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body, ["email", "name"]);

    // Validate input
    const validation = validateRegistration({
      email: sanitizedData.email,
      password: req.body.password, // Don't trim password
      name: sanitizedData.name,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(sanitizedData.email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
        errors: {
          email: "Email is already registered",
        },
      });
    }

    // Create user
    const user = await UserModel.create({
      email: sanitizedData.email,
      password: req.body.password,
      name: sanitizedData.name || null,
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);

    // Handle database errors
    if (err.code === "23505") {
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
        errors: {
          email: "Email is already registered",
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body, ["email"]);

    // Validate input
    const validation = validateLogin({
      email: sanitizedData.email,
      password: req.body.password,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Verify credentials
    const user = await UserModel.verifyPassword(
      sanitizedData.email,
      req.body.password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};

/**
 * Get user profile
 * GET /api/auth/profile
 * Protected route - requires authentication
 */
export const getProfile = async (req, res) => {
  try {
    // User info is already attached by authenticateToken middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile.",
    });
  }
};

export default {
  register,
  login,
  getProfile,
};

