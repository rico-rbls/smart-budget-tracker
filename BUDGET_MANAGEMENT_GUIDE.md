# 💰 Budget Management System Guide

## Overview

The Smart Budget Tracker includes a comprehensive budget management system with budget creation, tracking, alerts, and spending analysis across different time periods.

---

## 🎯 Features

### ✅ Budget Operations
- **Create** - Set budgets for categories
- **Read** - Get all budgets or single budget
- **Update** - Modify budget amounts and periods
- **Delete** - Remove budgets
- **Status** - Track budget vs actual spending

### ✅ Budget Periods
- **Weekly** - Track weekly spending limits
- **Monthly** - Track monthly spending limits (default)
- **Yearly** - Track annual spending limits
- **Custom Dates** - Set custom start and end dates

### ✅ Alert System
- **Safe** - Under 80% of budget (no alert)
- **Warning** - 80-99% of budget (⚠️ warning alert)
- **Exceeded** - 100-119% of budget (🚨 alert)
- **Critical** - 120%+ of budget (🔴 critical alert)

### ✅ Budget Status Tracking
- Real-time spending calculation
- Percentage used
- Remaining amount
- Transaction count
- Category breakdown
- Overall summary

---

## 📡 API Endpoints

### 1. Create Budget
```
POST /api/budgets
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "category_id": 1,
  "amount": 500.00,
  "period": "monthly",
  "start_date": "2024-12-01",
  "end_date": "2024-12-31"
}
```

**Required Fields:**
- `category_id` (integer, must exist and belong to user)
- `amount` (positive number, max 2 decimal places)

**Optional Fields:**
- `period` (string: weekly, monthly, yearly - default: monthly)
- `start_date` (YYYY-MM-DD format - auto-calculated if not provided)
- `end_date` (YYYY-MM-DD format - auto-calculated if not provided)

**Response:**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "budget": {
      "id": 1,
      "user_id": 2,
      "category_id": 1,
      "amount": "500.00",
      "period": "monthly",
      "start_date": "2024-12-01T00:00:00.000Z",
      "end_date": "2024-12-31T00:00:00.000Z",
      "created_at": "2024-12-10T17:00:00.000Z",
      "updated_at": "2024-12-10T17:00:00.000Z",
      "category_name": "Groceries",
      "color": "#10B981",
      "icon": "shopping-cart"
    }
  }
}
```

**Notes:**
- Only one budget per category per period is allowed
- If dates are not provided, they are auto-calculated based on period
- Category must belong to the authenticated user

---

### 2. Get All Budgets
```
GET /api/budgets
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | - | Filter by period (weekly, monthly, yearly) |

**Response:**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": 1,
        "user_id": 2,
        "category_id": 1,
        "amount": "500.00",
        "period": "monthly",
        "start_date": "2024-12-01T00:00:00.000Z",
        "end_date": "2024-12-31T00:00:00.000Z",
        "created_at": "2024-12-10T17:00:00.000Z",
        "updated_at": "2024-12-10T17:00:00.000Z",
        "category_name": "Groceries",
        "color": "#10B981",
        "icon": "shopping-cart"
      }
    ],
    "count": 1
  }
}
```

---

### 3. Get Budget by ID
```
GET /api/budgets/:id
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
    "budget": {
      "id": 1,
      "user_id": 2,
      "category_id": 1,
      "amount": "500.00",
      "period": "monthly",
      "start_date": "2024-12-01T00:00:00.000Z",
      "end_date": "2024-12-31T00:00:00.000Z",
      "created_at": "2024-12-10T17:00:00.000Z",
      "updated_at": "2024-12-10T17:00:00.000Z",
      "category_name": "Groceries",
      "color": "#10B981",
      "icon": "shopping-cart"
    }
  }
}
```

---

### 4. Update Budget
```
PUT /api/budgets/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:** (all fields optional)
```json
{
  "amount": 600.00,
  "period": "monthly",
  "start_date": "2024-12-01",
  "end_date": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "budget": { ... }
  }
}
```

**Notes:**
- Cannot change category_id (create new budget instead)
- All validation rules apply to updated fields

---

### 5. Delete Budget
```
DELETE /api/budgets/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

---

### 6. Get Budget Status
```
GET /api/budgets/status
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | monthly | Period type (weekly, monthly, yearly) |

**Response:**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "budget_id": 1,
        "category_id": 1,
        "category_name": "Groceries",
        "color": "#10B981",
        "icon": "shopping-cart",
        "period": "monthly",
        "start_date": "2024-12-01",
        "end_date": "2024-12-31",
        "budget_amount": 500,
        "spent_amount": 425,
        "remaining_amount": 75,
        "percentage_used": 85,
        "transaction_count": 12,
        "status": "warning",
        "alert_level": "warning"
      }
    ],
    "summary": {
      "total_budget": 1500,
      "total_spent": 1200,
      "total_remaining": 300,
      "overall_percentage": 80
    }
  }
}
```

**Status Values:**
- `safe` - Under 80% of budget
- `warning` - 80-99% of budget
- `exceeded` - 100-119% of budget
- `critical` - 120%+ of budget

**Alert Levels:**
- `null` - No alert (safe)
- `warning` - 80% threshold reached
- `alert` - 100% threshold reached (over budget)
- `critical` - 120% threshold reached (significantly over budget)

---

## 💻 Usage Examples

### Create Monthly Budget
```bash
curl -X POST http://localhost:3002/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "amount": 500.00,
    "period": "monthly"
  }'
```

### Create Weekly Budget with Custom Dates
```bash
curl -X POST http://localhost:3002/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 2,
    "amount": 100.00,
    "period": "weekly",
    "start_date": "2024-12-09",
    "end_date": "2024-12-15"
  }'
```

### Get All Budgets
```bash
curl -X GET http://localhost:3002/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter Budgets by Period
```bash
curl -X GET "http://localhost:3002/api/budgets?period=monthly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Budget Amount
```bash
curl -X PUT http://localhost:3002/api/budgets/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600.00
  }'
```

### Delete Budget
```bash
curl -X DELETE http://localhost:3002/api/budgets/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Budget Status
```bash
curl -X GET "http://localhost:3002/api/budgets/status?period=monthly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Validation Rules

### Amount
- ✅ Required
- ✅ Must be greater than zero
- ✅ Maximum 2 decimal places
- ✅ Maximum value: 999,999,999.99

### Period
- ✅ Optional (defaults to "monthly")
- ✅ Must be one of: weekly, monthly, yearly

### Start Date & End Date
- ✅ Optional (auto-calculated based on period if not provided)
- ✅ Must be in YYYY-MM-DD format
- ✅ End date must be after start date

### Category ID
- ✅ Required
- ✅ Must exist in database
- ✅ Must belong to the authenticated user
- ✅ Only one budget per category per period allowed

---

## 🚨 Alert System Explained

### Alert Thresholds

| Percentage | Status | Alert Level | Description |
|------------|--------|-------------|-------------|
| 0-79% | safe | null | Spending is under control |
| 80-99% | warning | warning | Approaching budget limit |
| 100-119% | exceeded | alert | Over budget |
| 120%+ | critical | critical | Significantly over budget |

### Alert Use Cases

**Safe (< 80%)**
- ✅ No action needed
- Budget is on track
- Continue normal spending

**Warning (80-99%)**
- ⚠️ Caution advised
- Approaching budget limit
- Consider reducing spending
- Review remaining days in period

**Exceeded (100-119%)**
- 🚨 Over budget
- Immediate attention needed
- Stop non-essential spending
- Review transactions

**Critical (120%+)**
- 🔴 Significantly over budget
- Urgent action required
- Analyze spending patterns
- Consider budget adjustment

---

## 📊 Budget Periods Explained

### Weekly Budgets
- **Duration**: 7 days (Sunday to Saturday)
- **Auto-calculated dates**: Current week
- **Use case**: Short-term spending control
- **Example**: Weekly dining budget of $100

### Monthly Budgets (Default)
- **Duration**: Full calendar month
- **Auto-calculated dates**: 1st to last day of current month
- **Use case**: Standard budget tracking
- **Example**: Monthly groceries budget of $500

### Yearly Budgets
- **Duration**: Full calendar year
- **Auto-calculated dates**: Jan 1 to Dec 31 of current year
- **Use case**: Long-term financial planning
- **Example**: Annual entertainment budget of $2,000

### Custom Date Budgets
- **Duration**: Any date range
- **Dates**: Manually specified start_date and end_date
- **Use case**: Special projects or events
- **Example**: Holiday shopping budget from Nov 15 to Dec 25

---

## 🛡️ Security Features

- ✅ **JWT authentication** required for all endpoints
- ✅ **User ownership verification** (can't access other users' budgets)
- ✅ **Category ownership verification** (can't use other users' categories)
- ✅ **Input validation** on all fields
- ✅ **SQL injection prevention** (parameterized queries)
- ✅ **Duplicate prevention** (one budget per category per period)
- ✅ **Error handling** for all edge cases

---

## 📁 File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── budgetController.js        # Budget CRUD & status
│   ├── models/
│   │   └── Budget.model.js            # Database operations
│   ├── routes/
│   │   └── budgets.js                 # API routes
│   └── utils/
│       └── budgetValidation.js        # Validation utilities
└── test-budgets.sh                    # Comprehensive test script
```

---

## 🧪 Testing

Run the comprehensive test script:

```bash
cd server
./test-budgets.sh
```

This tests:
- ✅ Create budget
- ✅ Get all budgets
- ✅ Get single budget
- ✅ Update budget
- ✅ Delete budget
- ✅ Budget status calculation
- ✅ Alert levels (safe, warning, exceeded, critical)
- ✅ Period filtering
- ✅ Validation errors

---

## 📚 Related Documentation

- **[TRANSACTION_MANAGEMENT_GUIDE.md](TRANSACTION_MANAGEMENT_GUIDE.md)** - Transaction system
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication system
- **[RECEIPT_UPLOAD_GUIDE.md](RECEIPT_UPLOAD_GUIDE.md)** - Receipt upload & OCR
- **[server/API_DOCUMENTATION.md](server/API_DOCUMENTATION.md)** - Complete API reference
- **[DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)** - Database setup

---

**🎉 Your budget management system is production-ready!**

