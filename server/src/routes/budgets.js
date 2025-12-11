import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
} from "../controllers/budgetController.js";

const router = express.Router();

// Get budget status (must be before /:id route to avoid conflict)
router.get("/status", authenticateToken, getBudgetStatus);

// Create new budget
router.post("/", authenticateToken, createBudget);

// Get all budgets
router.get("/", authenticateToken, getBudgets);

// Get single budget by ID
router.get("/:id", authenticateToken, getBudgetById);

// Update budget
router.put("/:id", authenticateToken, updateBudget);

// Delete budget
router.delete("/:id", authenticateToken, deleteBudget);

export default router;

