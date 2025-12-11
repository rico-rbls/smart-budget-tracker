# Database Setup & Management

This directory contains all database-related files for the Smart Budget Tracker application.

## 📁 Directory Structure

```
database/
├── migrations/           # SQL migration files
│   └── 001_create_schema.sql
├── seeds/               # SQL seed data files
│   ├── 001_default_categories.sql
│   └── 002_sample_data.sql
├── setup.js            # Database setup script
└── README.md           # This file
```

## 🗄️ Database Schema

### Tables

1. **users** - User account information
2. **categories** - Expense categories (user-specific)
3. **receipts** - Uploaded receipt images and OCR data
4. **transactions** - Financial transactions
5. **budgets** - Budget limits for categories

### Entity Relationship

```
users (1) ──< (many) categories
users (1) ──< (many) receipts
users (1) ──< (many) transactions
users (1) ──< (many) budgets

categories (1) ──< (many) transactions
categories (1) ──< (many) budgets

receipts (1) ──< (many) transactions
```

## 🚀 Quick Start

### Prerequisites

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-14
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   # Using psql
   createdb budget_tracker_db
   
   # Or using SQL
   psql -U postgres
   CREATE DATABASE budget_tracker_db;
   ```

3. **Update Environment Variables**
   
   Edit `server/.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/budget_tracker_db
   ```

### Setup Commands

```bash
# Navigate to server directory
cd server

# Run full setup (migrations + seeds)
npm run db:setup

# Run only migrations
npm run db:migrate

# Run only seeds
npm run db:seed

# Reset database (drop all, migrate, seed)
npm run db:reset

# Fresh start (drop all, migrate only)
npm run db:fresh

# Show database statistics
npm run db:stats
```

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Run migrations and seeds (default) |
| `npm run db:migrate` | Run only migration files |
| `npm run db:seed` | Run only seed files |
| `npm run db:reset` | Drop all tables, run migrations and seeds |
| `npm run db:fresh` | Drop all tables, run migrations only |
| `npm run db:stats` | Display table row counts |

## 📝 Table Details

### users
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `name` - User's display name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### categories
- `id` - Primary key
- `user_id` - Foreign key to users
- `name` - Category name (e.g., "Groceries")
- `color` - Hex color code for UI
- `icon` - Icon identifier
- `created_at` - Creation timestamp

### receipts
- `id` - Primary key
- `user_id` - Foreign key to users
- `image_url` - Path to uploaded image
- `upload_date` - Upload timestamp
- `ocr_text` - Extracted text from OCR
- `processed` - Processing status flag
- `created_at` - Creation timestamp

### transactions
- `id` - Primary key
- `user_id` - Foreign key to users
- `receipt_id` - Foreign key to receipts (nullable)
- `category_id` - Foreign key to categories (nullable)
- `merchant_name` - Store/merchant name
- `amount` - Transaction amount (DECIMAL 10,2)
- `transaction_date` - Date of transaction
- `description` - Transaction notes
- `payment_method` - Payment type (Credit Card, Cash, etc.)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### budgets
- `id` - Primary key
- `user_id` - Foreign key to users
- `category_id` - Foreign key to categories
- `amount` - Budget limit (DECIMAL 10,2)
- `period` - Budget period (monthly, weekly, yearly)
- `start_date` - Budget start date
- `end_date` - Budget end date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## 🔧 Database Functions

### create_default_categories(user_id)

Creates default categories for a new user.

**Usage:**
```sql
SELECT create_default_categories(1);
```

**Default Categories:**
- Groceries (#10B981, shopping-cart)
- Dining (#F59E0B, utensils)
- Transportation (#3B82F6, car)
- Entertainment (#8B5CF6, film)
- Shopping (#EC4899, shopping-bag)
- Utilities (#6366F1, bolt)
- Healthcare (#EF4444, heart)
- Other (#6B7280, folder)

## 🔍 Useful Queries

### Get user's total spending by category
```sql
SELECT 
  c.name,
  SUM(t.amount) as total_spent
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = $1
GROUP BY c.name
ORDER BY total_spent DESC;
```

### Get budget vs actual spending
```sql
SELECT 
  c.name,
  b.amount as budget,
  COALESCE(SUM(t.amount), 0) as spent,
  b.amount - COALESCE(SUM(t.amount), 0) as remaining
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = c.id 
  AND t.transaction_date BETWEEN b.start_date AND b.end_date
WHERE b.user_id = $1
GROUP BY c.name, b.amount;
```

## 🛡️ Security Notes

- All passwords are hashed using bcrypt
- Foreign keys use CASCADE delete for user data
- Indexes are created for common query patterns
- Connection pooling is configured for performance
- Prepared statements prevent SQL injection

## 🔄 Migration Best Practices

1. Always create new migration files with incremental numbers
2. Never modify existing migration files after they've been run
3. Test migrations on development database first
4. Keep migrations small and focused
5. Include rollback instructions in comments

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

