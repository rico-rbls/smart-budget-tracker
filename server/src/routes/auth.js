import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email: string, password: string, name?: string }
 * @returns { success: boolean, message: string, data: { user: object, token: string } }
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email: string, password: string }
 * @returns { success: boolean, message: string, data: { user: object, token: string } }
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 * @headers Authorization: Bearer <token>
 * @returns { success: boolean, data: { user: object } }
 */
router.get("/profile", authenticateToken, getProfile);

export default router;

