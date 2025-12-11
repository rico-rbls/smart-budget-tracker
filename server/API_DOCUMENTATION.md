# 📖 API Documentation - Smart Budget Tracker

Complete API reference for the Smart Budget Tracker backend.

## 🌐 Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## 📋 Response Format

All API responses follow this standard format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }  // Optional validation errors
}
```

---

## 📑 Table of Contents

1. [Authentication Endpoints](#-authentication-endpoints)
2. [Receipt Endpoints](#-receipt-endpoints)
3. [Transaction Endpoints](#-transaction-endpoints)
4. [Error Codes](#-error-codes)
5. [Security](#-security)

---

## 🔐 Authentication Endpoints

### Register User

Create a new user account.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| name | string | No | User's display name |

**Example Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- `400` - Validation failed
- `409` - Email already exists
- `500` - Server error

---

### Login User

Authenticate user and receive JWT token.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email |
| password | string | Yes | User's password |

**Example Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- `400` - Validation failed
- `401` - Invalid credentials
- `500` - Server error

---

### Get User Profile

Retrieve current user's profile information.

- **URL:** `/auth/profile`
- **Method:** `GET`
- **Auth Required:** Yes

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `401` - No token provided
- `401` - Invalid or expired token
- `500` - Server error

---

## 🔑 Authentication

### Using JWT Tokens

After successful login or registration, you'll receive a JWT token. Include this token in the `Authorization` header for all protected routes:

```
Authorization: Bearer <your_jwt_token>
```

### Token Expiration

- Tokens expire after **7 days**
- When a token expires, the user must login again
- Store tokens securely (e.g., localStorage, httpOnly cookies)

### Example with Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 HTTP Status Codes

| Code | Meaning               | Description                       |
| ---- | --------------------- | --------------------------------- |
| 200  | OK                    | Request successful                |
| 201  | Created               | Resource created successfully     |
| 400  | Bad Request           | Invalid request data              |
| 401  | Unauthorized          | Authentication required or failed |
| 403  | Forbidden             | Insufficient permissions          |
| 404  | Not Found             | Resource not found                |
| 409  | Conflict              | Resource already exists           |
| 500  | Internal Server Error | Server error                      |

---

## 🧪 Testing the API

### Health Check

Test if the API is running:

```bash
curl http://localhost:3001/api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Using the Test Script

```bash
cd server
./test-auth.sh
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:3001/api`
3. For protected routes, add header: `Authorization: Bearer <token>`

---

## 🔒 Security Best Practices

### For Frontend Developers

1. **Never store passwords** in localStorage or sessionStorage
2. **Store JWT tokens securely** (httpOnly cookies preferred)
3. **Clear tokens on logout**
4. **Handle token expiration** gracefully
5. **Use HTTPS** in production
6. **Validate user input** on the frontend too

### For Backend Developers

1. **Never log passwords** or tokens
2. **Use environment variables** for secrets
3. **Validate all input** server-side
4. **Use parameterized queries** to prevent SQL injection
5. **Rate limit** authentication endpoints
6. **Monitor for suspicious activity**

---

## 📸 Receipt Endpoints

### Upload Receipt

Upload a receipt image for OCR processing.

- **URL:** `/receipts/upload`
- **Method:** `POST`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| receipt | file | Yes | Image file (JPG, PNG, GIF, WEBP, PDF) |

**File Requirements:**

- Maximum size: 5MB
- Allowed formats: JPG, JPEG, PNG, GIF, WEBP, PDF
- Field name must be "receipt"

**Success Response (201 Created):**

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

**Error Responses:**

- `400 Bad Request` - No file uploaded or invalid file type
- `401 Unauthorized` - Missing or invalid token
- `413 Payload Too Large` - File exceeds 5MB limit

**Example:**

```bash
curl -X POST http://localhost:3001/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "receipt=@/path/to/receipt.jpg"
```

---

### Get All Receipts

Retrieve all receipts for the authenticated user.

- **URL:** `/receipts`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | number | No | 50 | Number of receipts to return |
| offset | number | No | 0 | Offset for pagination |
| processed | boolean | No | - | Filter by processed status |

**Success Response (200 OK):**

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
        "ocr_text": "WALMART\nStore #1234\nTotal: $12.39",
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

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

**Example:**

```bash
curl -X GET "http://localhost:3001/api/receipts?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Receipt by ID

Retrieve a specific receipt by ID.

- **URL:** `/receipts/:id`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Receipt ID |

**Success Response (200 OK):**

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

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Receipt belongs to another user
- `404 Not Found` - Receipt not found

**Example:**

```bash
curl -X GET http://localhost:3001/api/receipts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Delete Receipt

Delete a receipt and its associated file.

- **URL:** `/receipts/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Receipt ID |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Receipt deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Receipt belongs to another user
- `404 Not Found` - Receipt not found

**Example:**

```bash
curl -X DELETE http://localhost:3001/api/receipts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💰 Transaction Endpoints

### Create Transaction

Create a new manual transaction.

- **URL:** `/transactions`
- **Method:** `POST`
- **Auth Required:** Yes

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| merchant_name | string | Yes | Merchant name (max 255 chars) |
| amount | number | Yes | Transaction amount (positive, max 2 decimals) |
| transaction_date | string | Yes | Date in YYYY-MM-DD format |
| category_id | number | No | Category ID (must belong to user) |
| description | string | No | Transaction description (max 1000 chars) |
| payment_method | string | No | Payment method (cash, credit_card, etc.) |

**Success Response (201 Created):**

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

**Error Responses:**

- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Category doesn't belong to user
- `404 Not Found` - Category not found

**Example:**

```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Walmart",
    "amount": 45.99,
    "transaction_date": "2024-12-08",
    "description": "Groceries",
    "payment_method": "credit_card"
  }'
```

---

### Get All Transactions

Retrieve all transactions with filtering, sorting, and pagination.

- **URL:** `/transactions`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Number of transactions to return |
| offset | number | 0 | Offset for pagination |
| category_id | number | - | Filter by category |
| merchant_name | string | - | Search merchant (partial match) |
| start_date | string | - | Start date (YYYY-MM-DD) |
| end_date | string | - | End date (YYYY-MM-DD) |
| min_amount | number | - | Minimum amount |
| max_amount | number | - | Maximum amount |
| sort_by | string | date | Sort field (date, amount, merchant) |
| sort_order | string | desc | Sort order (asc, desc) |

**Success Response (200 OK):**

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

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

**Example:**

```bash
# Get all transactions
curl -X GET http://localhost:3002/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by date range
curl -X GET "http://localhost:3002/api/transactions?start_date=2024-12-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by merchant
curl -X GET "http://localhost:3002/api/transactions?merchant_name=walmart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Transaction by ID

Retrieve a specific transaction.

- **URL:** `/transactions/:id`
- **Method:** `GET`
- **Auth Required:** Yes

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Transaction ID |

**Success Response (200 OK):**

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

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Transaction belongs to another user
- `404 Not Found` - Transaction not found

**Example:**

```bash
curl -X GET http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Update Transaction

Update an existing transaction.

- **URL:** `/transactions/:id`
- **Method:** `PUT`
- **Auth Required:** Yes

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Transaction ID |

**Request Body:** (all fields optional)
| Field | Type | Description |
|-------|------|-------------|
| merchant_name | string | Merchant name |
| amount | number | Transaction amount |
| transaction_date | string | Date (YYYY-MM-DD) |
| category_id | number | Category ID (can be null) |
| description | string | Description |
| payment_method | string | Payment method |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": {
      "id": 1,
      "user_id": 2,
      "receipt_id": null,
      "category_id": 2,
      "merchant_name": "Walmart Supercenter",
      "amount": "52.99",
      "transaction_date": "2024-12-08T00:00:00.000Z",
      "description": "Updated description",
      "payment_method": "debit_card",
      "created_at": "2024-12-10T17:00:00.000Z",
      "updated_at": "2024-12-10T17:05:00.000Z",
      "category_name": "Shopping"
    }
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Transaction or category belongs to another user
- `404 Not Found` - Transaction or category not found

**Example:**

```bash
curl -X PUT http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55.00,
    "category_id": 2,
    "description": "Updated amount and category"
  }'
```

---

### Delete Transaction

Delete a transaction.

- **URL:** `/transactions/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Transaction ID |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Transaction belongs to another user
- `404 Not Found` - Transaction not found

**Example:**

```bash
curl -X DELETE http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Transaction Statistics

Get spending statistics and analytics.

- **URL:** `/transactions/stats`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | month | Period type (week, month, year) |
| start_date | string | - | Custom start date (YYYY-MM-DD) |
| end_date | string | - | Custom end date (YYYY-MM-DD) |

**Success Response (200 OK):**

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
      "previous_period_total": 150.0,
      "change_amount": 53.48,
      "change_percentage": 35.65
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid token

**Example:**

```bash
# Get current month statistics
curl -X GET "http://localhost:3002/api/transactions/stats?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get custom date range statistics
curl -X GET "http://localhost:3002/api/transactions/stats?start_date=2024-11-01&end_date=2024-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Coming Soon

The following endpoints are planned for future releases:

- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/logout` - Logout user (token blacklist)
- `DELETE /auth/account` - Delete user account

---

## 📚 Additional Documentation

- **[AUTHENTICATION_GUIDE.md](../AUTHENTICATION_GUIDE.md)** - Detailed authentication guide
- **[DATABASE_SETUP_GUIDE.md](../DATABASE_SETUP_GUIDE.md)** - Database setup instructions
- **[README.md](../README.md)** - Project overview

---

**Need help?** Check the example code in the authentication guide or run the test script to see working examples.
