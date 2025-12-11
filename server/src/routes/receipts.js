import express from "express";
import {
  uploadReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
} from "../controllers/receiptController.js";
import { authenticateToken } from "../middleware/auth.js";
import upload, { handleMulterError } from "../config/multer.js";

const router = express.Router();

/**
 * @route   POST /api/receipts/upload
 * @desc    Upload receipt image and process with OCR
 * @access  Private
 */
router.post(
  "/upload",
  authenticateToken,
  upload.single("receipt"),
  handleMulterError,
  uploadReceipt
);

/**
 * @route   GET /api/receipts
 * @desc    Get all receipts for logged-in user
 * @access  Private
 * @query   limit - Number of receipts to return (default: 50)
 * @query   offset - Offset for pagination (default: 0)
 * @query   processed - Filter by processed status (true/false)
 */
router.get("/", authenticateToken, getAllReceipts);

/**
 * @route   GET /api/receipts/:id
 * @desc    Get specific receipt by ID
 * @access  Private
 */
router.get("/:id", authenticateToken, getReceiptById);

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete receipt and associated file
 * @access  Private
 */
router.delete("/:id", authenticateToken, deleteReceipt);

export default router;

