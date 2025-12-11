# 🔐 Authentication System Guide - Smart Budget Tracker

Complete guide to the JWT-based authentication system for the Smart Budget Tracker application.

## 📋 Overview

The authentication system provides secure user registration, login, and protected route access using JSON Web Tokens (JWT).

### Features

✅ **User Registration** with email and password  
✅ **Password Hashing** using bcryptjs (10 salt rounds)  
✅ **JWT Token Generation** with 7-day expiration  
✅ **Password Validation** (min 8 chars, uppercase, number)  
✅ **Email Validation** with RFC 5322 compliance  
✅ **Protected Routes** with token verification  
✅ **Automatic Default Categories** on user registration  
✅ **Comprehensive Error Handling**  

---

## 🗂️ File Structure

```
server/src/
├── controllers/
│   └── authController.js       # Authentication logic
├── middleware/
│   └── auth.js                 # JWT verification middleware
├── models/
│   └── User.model.js           # User database operations
├── routes/
│   └── auth.js                 # Authentication routes
└── utils/
    └── validation.js           # Input validation utilities
```

---

## 🚀 API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"  // Optional
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

- **400 Bad Request** - Validation failed
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters long"
  }
}
```

- **409 Conflict** - Email already exists
```json
{
  "success": false,
  "message": "User with this email already exists",
  "errors": {
    "email": "Email is already registered"
  }
}
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`  
**Access:** Public

**Request Body:**
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

- **400 Bad Request** - Validation failed
- **401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get User Profile

**Endpoint:** `GET /api/auth/profile`  
**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
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

- **401 Unauthorized** - No token provided
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

- **401 Unauthorized** - Token expired
```json
{
  "success": false,
  "message": "Token has expired. Please login again."
}
```

- **401 Unauthorized** - Invalid token
```json
{
  "success": false,
  "message": "Invalid token. Please login again."
}
```

---

## 🔒 Password Requirements

Passwords must meet the following criteria:

- ✅ Minimum **8 characters** long
- ✅ At least **one uppercase letter** (A-Z)
- ✅ At least **one number** (0-9)

**Valid Examples:**
- `Password123`
- `SecurePass1`
- `MyP@ssw0rd`

**Invalid Examples:**
- `pass` - Too short
- `password` - No uppercase or number
- `PASSWORD` - No number
- `Password` - No number

---

## 🛡️ Security Features

### Password Hashing
- Uses **bcryptjs** with 10 salt rounds
- Passwords are never stored in plain text
- One-way hashing prevents password recovery

### JWT Tokens
- **Expiration:** 7 days
- **Algorithm:** HS256
- **Payload:** Contains only user ID
- **Secret:** Stored in environment variable

### Token Verification
- Validates token signature
- Checks expiration
- Verifies user still exists in database
- Attaches user info to request object

### Input Validation
- Email format validation (RFC 5322)
- Password strength validation
- Input sanitization (trim whitespace)
- SQL injection prevention (parameterized queries)

---

## 💻 Usage Examples

### Frontend (JavaScript/React)

#### Register User
```javascript
const register = async (email, password, name) => {
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
};
```

#### Login User
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
};
```

#### Get Profile (Protected Route)
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.data.user;
  } else {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('token');
    throw new Error(data.message);
  }
};
```

---

## 🧪 Testing

### Using the Test Script

```bash
# Make sure the server is running
cd server
npm run dev

# In another terminal, run the test script
./test-auth.sh
```

The test script will:
1. ✅ Register a new user
2. ✅ Test duplicate email rejection
3. ✅ Test weak password rejection
4. ✅ Login with correct credentials
5. ✅ Test wrong password rejection
6. ✅ Get profile with valid token
7. ✅ Test no token rejection
8. ✅ Test invalid token rejection

### Manual Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Middleware Usage

### Protecting Routes

```javascript
import { authenticateToken } from './middleware/auth.js';

// Protected route - requires authentication
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains user info
  // req.userId contains user ID
  res.json({ message: `Hello ${req.user.name}!` });
});
```

### Optional Authentication

```javascript
import { optionalAuth } from './middleware/auth.js';

// Route that works with or without authentication
router.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: `Hello ${req.user.name}!` });
  } else {
    res.json({ message: 'Hello guest!' });
  }
});
```

---

## 📚 Additional Resources

- **User Model:** `server/src/models/User.model.js`
- **Validation Utils:** `server/src/utils/validation.js`
- **Test Script:** `server/test-auth.sh`

---

**🎉 Your authentication system is production-ready!**

