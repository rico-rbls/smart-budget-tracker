# 💰 Transaction Management System Guide

## Overview

The Smart Budget Tracker includes a complete transaction management system with CRUD operations, advanced filtering, sorting, pagination, and comprehensive statistics.

---

## 🎯 Features

### ✅ Transaction Operations
- **Create** - Add manual transactions
- **Read** - Get all transactions or single transaction
- **Update** - Edit transaction details (including category changes)
- **Delete** - Remove transactions
- **Statistics** - Get spending insights and trends

### ✅ Advanced Filtering
- **Date range** - Filter by start_date and end_date
- **Category** - Filter by category_id
- **Merchant** - Search by merchant name (partial match)
- **Amount range** - Filter by min_amount and max_amount
- **Sorting** - Sort by date, amount, or merchant
- **Pagination** - Limit and offset support

### ✅ Statistics & Analytics
- **Total spending** - Current period total
- **Spending by category** - Breakdown with percentages
- **Top merchants** - Top 5 merchants by spending
- **Daily trends** - Daily spending patterns
- **Period comparison** - Compare with previous period
- **Average transaction** - Average transaction amount

---

## 📡 API Endpoints

### 1. Create Transaction
```
POST /api/transactions
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "merchant_name": "Walmart",
  "amount": 45.99,
  "transaction_date": "2024-12-08",
  "category_id": 1,
  "description": "Groceries shopping",
  "payment_method": "credit_card"
}
```

**Required Fields:**
- `merchant_name` (string, max 255 chars)
- `amount` (positive number, max 2 decimal places)
- `transaction_date` (YYYY-MM-DD format, not in future, not more than 10 years ago)

**Optional Fields:**
- `category_id` (integer, must exist and belong to user)
- `description` (string, max 1000 chars)
- `payment_method` (enum: cash, credit_card, debit_card, bank_transfer, paypal, venmo, apple_pay, google_pay, other)

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": 1,
      "user_id": 2,
      "receipt_id": null,
      "category_id": 1,
      "merchant_name": "Walmart",
      "amount": "45.99",
      "transaction_date": "2024-12-08T00:00:00.000Z",
      "description": "Groceries shopping",
      "payment_method": "credit_card",
      "created_at": "2024-12-10T17:00:00.000Z",
      "updated_at": "2024-12-10T17:00:00.000Z",
      "category_name": "Groceries"
    }
  }
}
```

---

### 2. Get All Transactions
```
GET /api/transactions
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Number of transactions to return |
| offset | number | 0 | Offset for pagination |
| category_id | number | - | Filter by category |
| merchant_name | string | - | Search merchant name (partial match) |
| start_date | string | - | Filter by start date (YYYY-MM-DD) |
| end_date | string | - | Filter by end date (YYYY-MM-DD) |
| min_amount | number | - | Minimum transaction amount |
| max_amount | number | - | Maximum transaction amount |
| sort_by | string | date | Sort field (date, amount, merchant) |
| sort_order | string | desc | Sort order (asc, desc) |

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "user_id": 2,
        "receipt_id": null,
        "category_id": 1,
        "merchant_name": "Walmart",
        "amount": "45.99",
        "transaction_date": "2024-12-08T00:00:00.000Z",
        "description": "Groceries shopping",
        "payment_method": "credit_card",
        "created_at": "2024-12-10T17:00:00.000Z",
        "updated_at": "2024-12-10T17:00:00.000Z",
        "category_name": "Groceries"
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

---

### 3. Get Transaction by ID
```
GET /api/transactions/:id
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
    "transaction": {
      "id": 1,
      "user_id": 2,
      "receipt_id": null,
      "category_id": 1,
      "merchant_name": "Walmart",
      "amount": "45.99",
      "transaction_date": "2024-12-08T00:00:00.000Z",
      "description": "Groceries shopping",
      "payment_method": "credit_card",
      "created_at": "2024-12-10T17:00:00.000Z",
      "updated_at": "2024-12-10T17:00:00.000Z",
      "category_name": "Groceries"
    }
  }
}
```

---

### 4. Update Transaction
```
PUT /api/transactions/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:** (all fields optional)
```json
{
  "merchant_name": "Walmart Supercenter",
  "amount": 52.99,
  "transaction_date": "2024-12-08",
  "category_id": 2,
  "description": "Updated description",
  "payment_method": "debit_card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": { ... }
  }
}
```

**Notes:**
- Can update category (including setting to null)
- Can manually adjust auto-categorized transactions
- All validation rules apply to updated fields

---

### 5. Delete Transaction
```
DELETE /api/transactions/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

### 6. Get Statistics
```
GET /api/transactions/stats
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | month | Period type (week, month, year) |
| start_date | string | - | Custom start date (YYYY-MM-DD) |
| end_date | string | - | Custom end date (YYYY-MM-DD) |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-12-01",
      "end_date": "2024-12-10",
      "type": "month"
    },
    "summary": {
      "total_spending": 203.48,
      "transaction_count": 4,
      "average_amount": 50.87
    },
    "spending_by_category": [
      {
        "category_id": 1,
        "category_name": "Groceries",
        "color": "#10B981",
        "icon": "shopping-cart",
        "total": 98.98,
        "count": 2,
        "percentage": 48.65
      }
    ],
    "top_merchants": [
      {
        "merchant_name": "Walmart",
        "total": 98.98,
        "count": 2
      }
    ],
    "daily_spending": [
      {
        "date": "2024-12-08",
        "total": 45.99,
        "count": 1
      }
    ],
    "comparison": {
      "previous_period_total": 150.00,
      "change_amount": 53.48,
      "change_percentage": 35.65
    }
  }
}
```

---

## 💻 Usage Examples

### Create Transaction
```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Starbucks",
    "amount": 12.50,
    "transaction_date": "2024-12-09",
    "description": "Morning coffee",
    "payment_method": "credit_card"
  }'
```

### Get All Transactions
```bash
curl -X GET http://localhost:3002/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Date Range
```bash
curl -X GET "http://localhost:3002/api/transactions?start_date=2024-12-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Category
```bash
curl -X GET "http://localhost:3002/api/transactions?category_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search by Merchant
```bash
curl -X GET "http://localhost:3002/api/transactions?merchant_name=walmart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Amount Range
```bash
curl -X GET "http://localhost:3002/api/transactions?min_amount=50&max_amount=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Sort by Amount
```bash
curl -X GET "http://localhost:3002/api/transactions?sort_by=amount&sort_order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Pagination
```bash
curl -X GET "http://localhost:3002/api/transactions?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Transaction
```bash
curl -X PUT http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55.00,
    "description": "Updated amount"
  }'
```

### Delete Transaction
```bash
curl -X DELETE http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Statistics (Current Month)
```bash
curl -X GET "http://localhost:3002/api/transactions/stats?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Statistics (Custom Date Range)
```bash
curl -X GET "http://localhost:3002/api/transactions/stats?start_date=2024-11-01&end_date=2024-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Validation Rules

### Amount
- ✅ Required
- ✅ Must be a positive number
- ✅ Maximum 2 decimal places
- ✅ Maximum value: 999,999,999.99

### Transaction Date
- ✅ Required
- ✅ Must be in YYYY-MM-DD format
- ✅ Cannot be in the future
- ✅ Cannot be more than 10 years in the past

### Merchant Name
- ✅ Required
- ✅ Maximum 255 characters

### Payment Method (Optional)
- ✅ Must be one of: cash, credit_card, debit_card, bank_transfer, paypal, venmo, apple_pay, google_pay, other

### Description (Optional)
- ✅ Maximum 1000 characters

### Category ID (Optional)
- ✅ Must exist in database
- ✅ Must belong to the authenticated user

---

## 🛡️ Security Features

- ✅ **JWT authentication** required for all endpoints
- ✅ **User ownership verification** (can't access other users' transactions)
- ✅ **Category ownership verification** (can't use other users' categories)
- ✅ **Input validation** on all fields
- ✅ **SQL injection prevention** (parameterized queries)
- ✅ **Error handling** for all edge cases

---

## 📊 Statistics Explained

### Period Types
- **week** - Last 7 days
- **month** - Current month (from 1st to today)
- **year** - Current year (from Jan 1 to today)
- **custom** - Specify start_date and end_date

### Spending by Category
- Shows total spending per category
- Includes transaction count
- Calculates percentage of total spending
- Includes category color and icon for UI

### Top Merchants
- Top 5 merchants by total spending
- Includes transaction count per merchant

### Daily Spending
- Daily breakdown of spending
- Useful for charts and trends

### Comparison
- Compares current period with previous period of same length
- Shows absolute change and percentage change
- Helps identify spending trends

---

## 🔄 Manual Category Adjustment

Users can manually adjust auto-categorized transactions from receipts:

```bash
# Update category for a receipt-generated transaction
curl -X PUT http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 5
  }'
```

---

## 📁 File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── transactionController.js   # Transaction CRUD & stats
│   ├── models/
│   │   └── Transaction.model.js       # Database operations
│   ├── routes/
│   │   └── transactions.js            # API routes
│   └── utils/
│       └── transactionValidation.js   # Validation utilities
└── test-transactions.sh               # Comprehensive test script
```

---

## 🧪 Testing

Run the comprehensive test script:

```bash
cd server
./test-transactions.sh
```

This tests:
- ✅ Create transaction
- ✅ Get all transactions
- ✅ Get single transaction
- ✅ Update transaction
- ✅ Delete transaction
- ✅ Date range filtering
- ✅ Merchant name search
- ✅ Amount range filtering
- ✅ Sorting
- ✅ Pagination
- ✅ Statistics
- ✅ Validation errors

---

## 📚 Related Documentation

- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication system
- **[RECEIPT_UPLOAD_GUIDE.md](RECEIPT_UPLOAD_GUIDE.md)** - Receipt upload & OCR
- **[server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)** - Complete API reference
- **[DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)** - Database setup

---

**🎉 Your transaction management system is production-ready!**

