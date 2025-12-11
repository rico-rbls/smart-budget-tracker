# 📸 Receipt Upload & OCR Processing Guide

## Overview

The Smart Budget Tracker includes a complete receipt upload and OCR (Optical Character Recognition) processing system that automatically extracts transaction data from receipt images.

---

## 🎯 Features

### ✅ File Upload
- **Supported formats**: JPG, JPEG, PNG, GIF, WEBP, PDF
- **Maximum file size**: 5MB
- **Unique filenames**: Automatically generated to prevent conflicts
- **Secure storage**: Files stored in `server/uploads/receipts/`

### ✅ OCR Processing
- **Tesseract.js integration**: Industry-standard OCR engine
- **Automatic text extraction**: Extracts all text from receipt images
- **Asynchronous processing**: Upload returns immediately, OCR runs in background
- **Confidence scoring**: Tracks OCR accuracy

### ✅ Data Parsing
- **Merchant name detection**: Identifies store/merchant name
- **Total amount extraction**: Finds total purchase amount
- **Date extraction**: Supports multiple date formats
- **Line items**: Extracts individual items and prices

### ✅ Automatic Categorization
- **Merchant-based**: Categorizes based on merchant name
- **70+ patterns**: Pre-configured patterns for common merchants
- **8 categories**: Groceries, Dining, Transportation, Entertainment, Shopping, Utilities, Healthcare, Other

### ✅ Transaction Creation
- **Auto-create transactions**: Automatically creates transaction from receipt data
- **Category assignment**: Assigns category based on merchant
- **Receipt linking**: Links transaction to receipt for reference

---

## 📡 API Endpoints

### 1. Upload Receipt
```
POST /api/receipts/upload
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body:**
```
receipt: <file> (form-data field name must be "receipt")
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt uploaded successfully. Processing OCR...",
  "data": {
    "receipt": {
      "id": 1,
      "image_url": "/uploads/receipts/1733850123456-receipt.jpg",
      "upload_date": "2024-12-10T16:55:23.456Z",
      "processed": false
    }
  }
}
```

### 2. Get All Receipts
```
GET /api/receipts
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of receipts to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `processed` (optional): Filter by processed status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "receipts": [
      {
        "id": 1,
        "user_id": 2,
        "image_url": "/uploads/receipts/1733850123456-receipt.jpg",
        "upload_date": "2024-12-10T16:55:23.456Z",
        "ocr_text": "WALMART\nStore #1234...",
        "processed": true,
        "created_at": "2024-12-10T16:55:23.456Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### 3. Get Receipt by ID
```
GET /api/receipts/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt": {
      "id": 1,
      "user_id": 2,
      "image_url": "/uploads/receipts/1733850123456-receipt.jpg",
      "upload_date": "2024-12-10T16:55:23.456Z",
      "ocr_text": "WALMART\nStore #1234\nTotal: $12.39",
      "processed": true,
      "created_at": "2024-12-10T16:55:23.456Z"
    }
  }
}
```

### 4. Delete Receipt
```
DELETE /api/receipts/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt deleted successfully"
}
```

---

## 🔧 How It Works

### Upload Flow

1. **User uploads receipt image**
   - Frontend sends multipart/form-data request
   - File is validated (type, size)
   - Unique filename is generated

2. **Receipt record created**
   - Database record created with `processed: false`
   - Image URL stored
   - Upload returns immediately

3. **OCR processing (background)**
   - Tesseract.js extracts text from image
   - Text is parsed to extract structured data
   - Receipt record updated with OCR text

4. **Transaction creation**
   - Merchant name identified
   - Category determined from merchant patterns
   - Transaction automatically created
   - Receipt marked as `processed: true`

---

## 🎨 Merchant Categorization

The system automatically categorizes transactions based on merchant names:

### Groceries
- Walmart, Target, Kroger, Safeway, Whole Foods, Trader Joe's, Aldi, Costco, etc.

### Dining
- McDonald's, Burger King, Starbucks, Chipotle, Subway, Pizza Hut, etc.

### Transportation
- Shell, Exxon, Chevron, BP, Uber, Lyft, Metro, Parking, etc.

### Entertainment
- Netflix, Hulu, Disney+, Spotify, AMC, Regal, Steam, etc.

### Shopping
- Amazon, eBay, Best Buy, Macy's, Nordstrom, H&M, Home Depot, etc.

### Utilities
- Electric companies, Gas companies, Internet, Cable, Phone providers, etc.

### Healthcare
- CVS, Walgreens, Pharmacies, Hospitals, Clinics, Dentists, etc.

### Other
- Default category for unrecognized merchants

---

## 💻 Usage Examples

### cURL Example
```bash
# Upload receipt
curl -X POST http://localhost:3001/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "receipt=@/path/to/receipt.jpg"

# Get all receipts
curl -X GET http://localhost:3001/api/receipts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific receipt
curl -X GET http://localhost:3001/api/receipts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete receipt
curl -X DELETE http://localhost:3001/api/receipts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/Fetch Example
```javascript
// Upload receipt
const formData = new FormData();
formData.append('receipt', fileInput.files[0]);

const response = await fetch('/api/receipts/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('Receipt uploaded:', data.data.receipt);
```

---

## 📊 Database Schema

### Receipts Table
```sql
CREATE TABLE receipts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  upload_date TIMESTAMP DEFAULT NOW(),
  ocr_text TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table (linked to receipts)
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receipt_id INTEGER REFERENCES receipts(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  merchant_name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛡️ Security Features

### File Validation
- ✅ File type validation (whitelist approach)
- ✅ File size limit (5MB maximum)
- ✅ Unique filename generation
- ✅ Extension verification

### Access Control
- ✅ JWT authentication required
- ✅ User ownership verification
- ✅ Cannot access other users' receipts
- ✅ Cannot delete other users' receipts

### Error Handling
- ✅ Invalid file type rejection
- ✅ File size limit enforcement
- ✅ OCR processing error handling
- ✅ Database transaction rollback on errors

---

## 🧪 Testing

### Manual Testing

1. **Create a test receipt image** (or use a real receipt photo)

2. **Login to get token**
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"YourPass123"}' \
  | jq -r '.data.token')
```

3. **Upload receipt**
```bash
curl -X POST http://localhost:3001/api/receipts/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "receipt=@receipt.jpg"
```

4. **Wait a few seconds for OCR processing**

5. **Check receipt status**
```bash
curl -X GET http://localhost:3001/api/receipts/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Automated Testing

Run the test script:
```bash
cd server
./test-receipts.sh
```

---

## 📁 File Structure

```
server/
├── src/
│   ├── config/
│   │   └── multer.js              # File upload configuration
│   ├── controllers/
│   │   └── receiptController.js   # Receipt upload & management
│   ├── models/
│   │   ├── Receipt.model.js       # Receipt database operations
│   │   ├── Transaction.model.js   # Transaction database operations
│   │   └── Category.model.js      # Category database operations
│   ├── routes/
│   │   └── receipts.js            # Receipt API routes
│   ├── services/
│   │   └── ocrService.js          # OCR processing with Tesseract
│   └── utils/
│       └── categorization.js      # Merchant categorization logic
└── uploads/
    └── receipts/                  # Uploaded receipt images
        └── .gitkeep
```

---

## 🚀 Next Steps

1. **Frontend Integration**
   - Create receipt upload form
   - Display receipt list
   - Show OCR results
   - Link receipts to transactions

2. **Enhanced OCR**
   - Improve parsing accuracy
   - Support more receipt formats
   - Add manual correction interface

3. **Advanced Features**
   - Bulk upload
   - Receipt search
   - OCR confidence threshold
   - Manual category override

---

## 📚 Related Documentation

- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication system
- **[server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)** - Complete API reference
- **[DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)** - Database setup

---

**🎉 Your receipt upload and OCR system is ready to use!**

