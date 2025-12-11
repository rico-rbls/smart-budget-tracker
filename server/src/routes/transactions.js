import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getStats,
} from "../controllers/transactionController.js";

const router = express.Router();

/**
 * Transaction Routes
 * All routes require authentication
 */

// Get statistics (must be before /:id route to avoid conflict)
router.get("/stats", authenticateToken, getStats);

// Create new transaction
router.post("/", authenticateToken, createTransaction);

// Get all transactions with filters
router.get("/", authenticateToken, getTransactions);

// Get single transaction by ID
router.get("/:id", authenticateToken, getTransactionById);

// Update transaction
router.put("/:id", authenticateToken, updateTransaction);

// Delete transaction
router.delete("/:id", authenticateToken, deleteTransaction);

export default router;

