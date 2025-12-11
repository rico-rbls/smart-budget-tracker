import ReceiptModel from "../models/Receipt.model.js";
import TransactionModel from "../models/Transaction.model.js";
import CategoryModel from "../models/Category.model.js";
import {
  extractTextFromImage,
  parseReceiptData,
} from "../services/ocrService.js";
import { categorizeMerchant } from "../utils/categorization.js";
import { getFilePath, deleteFile, getFileUrl } from "../config/multer.js";

/**
 * Upload receipt and process with OCR
 * @route POST /api/receipts/upload
 * @access Private
 */
export const uploadReceipt = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload a receipt image.",
      });
    }

    const userId = req.userId;
    const filename = req.file.filename;
    const filePath = getFilePath(filename);
    const fileUrl = getFileUrl(filename);

    console.log(`📤 Receipt uploaded by user ${userId}: ${filename}`);

    // Create receipt record in database (unprocessed initially)
    const receipt = await ReceiptModel.create({
      user_id: userId,
      image_url: fileUrl,
      ocr_text: null,
      processed: false,
    });

    // Process OCR in background (don't wait for it)
    processReceiptOCR(receipt.id, userId, filePath).catch((err) => {
      console.error(`❌ OCR processing failed for receipt ${receipt.id}:`, err);
    });

    res.status(201).json({
      success: true,
      message: "Receipt uploaded successfully. Processing OCR...",
      data: {
        receipt: {
          id: receipt.id,
          image_url: receipt.image_url,
          upload_date: receipt.upload_date,
          processed: receipt.processed,
        },
      },
    });
  } catch (err) {
    console.error("Error uploading receipt:", err);

    // Clean up uploaded file if database operation failed
    if (req.file) {
      deleteFile(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload receipt",
      error: err.message,
    });
  }
};

/**
 * Process receipt with OCR and create transaction
 * This runs asynchronously after upload
 */
const processReceiptOCR = async (receiptId, userId, filePath) => {
  try {
    console.log(`🔄 Processing OCR for receipt ${receiptId}...`);

    // Extract text from image
    const { text, confidence } = await extractTextFromImage(filePath);

    console.log(
      `📝 OCR extracted ${text.length} characters with ${confidence}% confidence`
    );

    // Parse receipt data
    const parsedData = parseReceiptData(text);

    console.log(`📊 Parsed data:`, parsedData);

    // Update receipt with OCR text
    await ReceiptModel.update(receiptId, {
      ocr_text: text,
      processed: true,
    });

    // Create transaction from parsed data
    if (parsedData.totalAmount && parsedData.totalAmount > 0) {
      // Determine category based on merchant name
      let categoryId = null;
      if (parsedData.merchantName) {
        const categoryName = categorizeMerchant(parsedData.merchantName);
        if (categoryName) {
          const category = await CategoryModel.findByName(userId, categoryName);
          if (category) {
            categoryId = category.id;
          }
        }
      }

      // Create transaction
      const transaction = await TransactionModel.create({
        user_id: userId,
        receipt_id: receiptId,
        category_id: categoryId,
        merchant_name: parsedData.merchantName || "Unknown Merchant",
        amount: parsedData.totalAmount,
        transaction_date:
          parsedData.date || new Date().toISOString().split("T")[0],
        description: `Auto-created from receipt (${parsedData.items.length} items)`,
        payment_method: null,
      });

      console.log(
        `✅ Transaction created: ${transaction.id} for $${transaction.amount}`
      );
    }

    console.log(`✅ Receipt ${receiptId} processed successfully`);
  } catch (err) {
    console.error(`❌ Error processing receipt ${receiptId}:`, err);
    // Mark as processed even if failed, to avoid retry loops
    await ReceiptModel.update(receiptId, { processed: true });
  }
};

/**
 * Get all receipts for logged-in user
 * @route GET /api/receipts
 * @access Private
 */
export const getAllReceipts = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0, processed } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (processed !== undefined) {
      options.processedOnly = processed === "true";
    }

    const receipts = await ReceiptModel.findByUserId(userId, options);
    const totalCount = await ReceiptModel.getCountByUserId(userId);

    res.json({
      success: true,
      data: {
        receipts,
        pagination: {
          total: totalCount,
          limit: options.limit,
          offset: options.offset,
          hasMore: options.offset + receipts.length < totalCount,
        },
      },
    });
  } catch (err) {
    console.error("Error getting receipts:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve receipts",
      error: err.message,
    });
  }
};

/**
 * Get specific receipt by ID
 * @route GET /api/receipts/:id
 * @access Private
 */
export const getReceiptById = async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    const userId = req.userId;

    const receipt = await ReceiptModel.findById(receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if receipt belongs to user
    if (receipt.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This receipt does not belong to you.",
      });
    }

    res.json({
      success: true,
      data: { receipt },
    });
  } catch (err) {
    console.error("Error getting receipt:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve receipt",
      error: err.message,
    });
  }
};

/**
 * Delete receipt
 * @route DELETE /api/receipts/:id
 * @access Private
 */
export const deleteReceipt = async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    const userId = req.userId;

    // Find receipt first
    const receipt = await ReceiptModel.findById(receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if receipt belongs to user
    if (receipt.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This receipt does not belong to you.",
      });
    }

    // Delete file from filesystem
    const filename = receipt.image_url.split("/").pop();
    deleteFile(filename);

    // Delete receipt from database (CASCADE will handle related transactions)
    await ReceiptModel.delete(receiptId);

    console.log(`🗑️ Receipt ${receiptId} deleted by user ${userId}`);

    res.json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting receipt:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete receipt",
      error: err.message,
    });
  }
};
