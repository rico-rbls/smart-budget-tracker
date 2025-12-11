# 🚀 Quick Reference - Smart Budget Tracker Backend

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/profile     - Get user profile (protected)
```

### Receipts

```
POST   /api/receipts/upload  - Upload receipt image (multipart/form-data)
GET    /api/receipts         - Get all receipts (protected)
GET    /api/receipts/:id     - Get specific receipt (protected)
DELETE /api/receipts/:id     - Delete receipt (protected)
```

### Health Check

```
GET    /api/health           - Server health check
```

---

## 🔑 Authentication Headers

For protected routes, include JWT token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Request Examples

### Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

### Login User

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Get Profile

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upload Receipt

```bash
curl -X POST http://localhost:3001/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "receipt=@/path/to/receipt.jpg"
```

### Get All Receipts

```bash
curl -X GET http://localhost:3001/api/receipts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete Receipt

```bash
curl -X DELETE http://localhost:3001/api/receipts/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 💰 Transaction Management

### Create Transaction

```bash
curl -X POST http://localhost:3002/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Walmart",
    "amount": 45.99,
    "transaction_date": "2024-12-08",
    "description": "Groceries",
    "payment_method": "credit_card"
  }'
```

### Get All Transactions

```bash
curl -X GET http://localhost:3002/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Filter Transactions

```bash
# By date range
curl -X GET "http://localhost:3002/api/transactions?start_date=2024-12-01&end_date=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# By merchant
curl -X GET "http://localhost:3002/api/transactions?merchant_name=walmart" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# By amount range
curl -X GET "http://localhost:3002/api/transactions?min_amount=50&max_amount=100" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Sort by amount
curl -X GET "http://localhost:3002/api/transactions?sort_by=amount&sort_order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Transaction

```bash
curl -X PUT http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55.00,
    "description": "Updated amount"
  }'
```

### Delete Transaction

```bash
curl -X DELETE http://localhost:3002/api/transactions/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Statistics

```bash
# Current month
curl -X GET "http://localhost:3002/api/transactions/stats?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Custom date range
curl -X GET "http://localhost:3002/api/transactions/stats?start_date=2024-11-01&end_date=2024-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🗄️ Database Commands

```bash
npm run db:setup     # Run migrations + seeds (first time)
npm run db:migrate   # Run only migrations
npm run db:seed      # Run only seeds
npm run db:reset     # Drop all, migrate, seed
npm run db:fresh     # Drop all, migrate only
npm run db:stats     # Show table statistics
```

---

## 🏃 Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Test authentication
./test-auth.sh
```

---

## 🔒 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one number

**Valid:** `Password123`, `SecurePass1`  
**Invalid:** `password`, `PASSWORD`, `Pass123` (too short)

---

## 📊 Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

---

## 🛡️ Middleware Usage

### Protect a Route

```javascript
import { authenticateToken } from "./middleware/auth.js";

router.get("/protected", authenticateToken, (req, res) => {
  // req.user contains user info
  // req.userId contains user ID
  res.json({ user: req.user });
});
```

### Optional Authentication

```javascript
import { optionalAuth } from "./middleware/auth.js";

router.get("/public", optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ message: `Hello ${req.user.name}` });
  } else {
    res.json({ message: "Hello guest" });
  }
});
```

---

## 📦 Models Usage

### User Model

```javascript
import UserModel from "./models/User.model.js";

// Create user
const user = await UserModel.create({
  email: "user@example.com",
  password: "plaintext",
  name: "John Doe",
});

// Find by email
const user = await UserModel.findByEmail("user@example.com");

// Find by ID
const user = await UserModel.findById(1);

// Verify password
const user = await UserModel.verifyPassword("user@example.com", "password");

// Update user
const updated = await UserModel.update(1, { name: "New Name" });

// Delete user
const deleted = await UserModel.delete(1);
```

---

## 🔧 Environment Variables

```env
PORT=3001
DATABASE_URL=postgresql://localhost:5432/budget_tracker_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 📚 Documentation Files

- `AUTHENTICATION_GUIDE.md` - Complete auth guide
- `API_DOCUMENTATION.md` - Full API reference
- `DATABASE_SETUP_GUIDE.md` - Database setup
- `database/README.md` - Database schema details

---

## 🧪 Testing

```bash
# Run test script
./test-auth.sh

# Manual health check
curl http://localhost:3001/api/health

# Check database stats
npm run db:stats
```

---

## ⚡ Common Tasks

### Add a New Protected Route

1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Import and use `authenticateToken` middleware
4. Add route to `src/server.js`

### Create a New Model

1. Create file in `src/models/`
2. Import database pool
3. Create static methods for CRUD operations
4. Export model class

### Add Validation

1. Add function to `src/utils/validation.js`
2. Use in controller before processing
3. Return validation errors if invalid

---

## 🐛 Troubleshooting

### Server won't start

- Check if port 3001 is available
- Verify environment variables in `.env`
- Check database connection

### Authentication fails

- Verify JWT_SECRET is set
- Check token format: `Bearer <token>`
- Ensure user exists in database

### Database errors

- Run `npm run db:setup` to initialize
- Check DATABASE_URL in `.env`
- Verify PostgreSQL is running

---

**Need more details?** Check the full documentation files listed above.
