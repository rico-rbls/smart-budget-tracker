import Tesseract from "tesseract.js";
import path from "path";

/**
 * OCR Service
 * Handles text extraction from receipt images using Tesseract.js
 */

/**
 * Extract text from image using OCR
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} { text: string, confidence: number }
 */
export const extractTextFromImage = async (imagePath) => {
  try {
    console.log(`🔍 Starting OCR processing for: ${path.basename(imagePath)}`);

    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log(`✅ OCR completed with ${result.data.confidence}% confidence`);

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (err) {
    console.error("❌ OCR processing error:", err);
    throw new Error(`OCR processing failed: ${err.message}`);
  }
};

/**
 * Parse receipt text to extract structured data
 * @param {string} text - Raw OCR text
 * @returns {Object} Parsed receipt data
 */
export const parseReceiptData = (text) => {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  const data = {
    merchantName: null,
    totalAmount: null,
    date: null,
    items: [],
  };

  // Extract merchant name (usually first few lines)
  data.merchantName = extractMerchantName(lines);

  // Extract total amount
  data.totalAmount = extractTotalAmount(text);

  // Extract date
  data.date = extractDate(text);

  // Extract line items
  data.items = extractLineItems(lines);

  return data;
};

/**
 * Extract merchant name from receipt lines
 * @param {string[]} lines - Array of text lines
 * @returns {string|null} Merchant name
 */
const extractMerchantName = (lines) => {
  // Merchant name is usually in the first 3 lines
  // Look for the longest line or first line with letters
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    // Skip lines that are mostly numbers or very short
    if (line.length > 3 && /[a-zA-Z]{3,}/.test(line)) {
      // Clean up the merchant name
      return line.replace(/[^a-zA-Z0-9\s&'-]/g, "").trim();
    }
  }
  return null;
};

/**
 * Extract total amount from receipt text
 * @param {string} text - Raw OCR text
 * @returns {number|null} Total amount
 */
const extractTotalAmount = (text) => {
  // Common patterns for total amount
  const patterns = [
    /total[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /amount[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /balance[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /grand\s*total[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /\$\s*(\d+[.,]\d{2})\s*total/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Convert to number, replacing comma with period if needed
      const amount = parseFloat(match[1].replace(",", "."));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // Fallback: look for largest dollar amount
  const allAmounts = text.match(/\$?\s*(\d+[.,]\d{2})/g);
  if (allAmounts && allAmounts.length > 0) {
    const amounts = allAmounts
      .map((a) => parseFloat(a.replace(/[$,]/g, "").replace(",", ".")))
      .filter((a) => !isNaN(a) && a > 0);

    if (amounts.length > 0) {
      return Math.max(...amounts);
    }
  }

  return null;
};

/**
 * Extract date from receipt text
 * @param {string} text - Raw OCR text
 * @returns {string|null} Date in YYYY-MM-DD format
 */
const extractDate = (text) => {
  // Common date patterns
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // Month DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let year, month, day;

        if (match[0].match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)) {
          // Month name format
          const monthNames = {
            jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
            jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
          };
          month = monthNames[match[1].toLowerCase().substring(0, 3)];
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        } else if (match[1].length === 4) {
          // YYYY-MM-DD format
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          // MM/DD/YYYY format (assuming US format)
          month = parseInt(match[1]);
          day = parseInt(match[2]);
          year = parseInt(match[3]);
          if (year < 100) year += 2000; // Handle 2-digit years
        }

        // Validate date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return dateStr;
        }
      } catch (err) {
        continue;
      }
    }
  }

  // Default to today if no date found
  return new Date().toISOString().split("T")[0];
};

/**
 * Extract line items from receipt
 * @param {string[]} lines - Array of text lines
 * @returns {Array} Array of line items
 */
const extractLineItems = (lines) => {
  const items = [];

  // Look for lines with both text and price
  const itemPattern = /^(.+?)\s+\$?\s*(\d+[.,]\d{2})$/;

  for (const line of lines) {
    const match = line.trim().match(itemPattern);
    if (match) {
      const itemName = match[1].trim();
      const price = parseFloat(match[2].replace(",", "."));

      // Skip if item name is too short or looks like a total
      if (
        itemName.length > 2 &&
        !itemName.toLowerCase().includes("total") &&
        !itemName.toLowerCase().includes("subtotal") &&
        !itemName.toLowerCase().includes("tax")
      ) {
        items.push({
          name: itemName,
          price: price,
        });
      }
    }
  }

  return items;
};

export default {
  extractTextFromImage,
  parseReceiptData,
};

