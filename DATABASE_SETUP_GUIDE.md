# 🗄️ Database Setup Guide - Smart Budget Tracker

Complete guide to setting up PostgreSQL database for the Smart Budget Tracker application.

## 📋 Prerequisites

Before setting up the database, you need to install PostgreSQL.

### Install PostgreSQL on macOS

```bash
# Using Homebrew (recommended)
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"

# Reload shell configuration
source ~/.zshrc  # or source ~/.bash_profile
```

### Install PostgreSQL on Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install PostgreSQL on Windows

1. Download installer from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user
4. Add PostgreSQL bin directory to PATH

### Verify Installation

```bash
psql --version
# Should output: psql (PostgreSQL) 14.x
```

## 🚀 Database Setup Steps

### Step 1: Create the Database

```bash
# Option 1: Using createdb command (easiest)
createdb budget_tracker_db

# Option 2: Using psql
psql -U postgres
CREATE DATABASE budget_tracker_db;
\q
```

### Step 2: Configure Environment Variables

Update your `server/.env` file with the correct database connection string:

```env
# For local development (default user)
DATABASE_URL=postgresql://localhost:5432/budget_tracker_db

# Or with username and password
DATABASE_URL=postgresql://username:password@localhost:5432/budget_tracker_db

# Example with postgres user
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/budget_tracker_db
```

**Connection String Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

### Step 3: Run Database Migrations

Navigate to the server directory and run the setup:

```bash
cd server

# Full setup (migrations + sample data)
npm run db:setup

# Or just migrations (no sample data)
npm run db:migrate
```

### Step 4: Verify Setup

```bash
# Check database statistics
npm run db:stats

# Or connect directly with psql
psql budget_tracker_db
\dt  # List all tables
\d users  # Describe users table
```

## 📊 Database Schema Overview

The database consists of 5 main tables:

### 1. **users** - User Accounts
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

### 2. **categories** - Expense Categories
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK → users)
- name (VARCHAR)
- color (VARCHAR - hex code)
- icon (VARCHAR)
- created_at (TIMESTAMP)
```

### 3. **receipts** - Receipt Images
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK → users)
- image_url (VARCHAR)
- upload_date (TIMESTAMP)
- ocr_text (TEXT)
- processed (BOOLEAN)
- created_at (TIMESTAMP)
```

### 4. **transactions** - Financial Transactions
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK → users)
- receipt_id (FK → receipts, nullable)
- category_id (FK → categories, nullable)
- merchant_name (VARCHAR)
- amount (DECIMAL 10,2)
- transaction_date (DATE)
- description (TEXT)
- payment_method (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

### 5. **budgets** - Budget Limits
```sql
- id (SERIAL PRIMARY KEY)
- user_id (FK → users)
- category_id (FK → categories)
- amount (DECIMAL 10,2)
- period (VARCHAR - monthly/weekly/yearly)
- start_date, end_date (DATE)
- created_at, updated_at (TIMESTAMP)
```

## 🛠️ Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:setup` | Run migrations and seeds (recommended for first setup) |
| `npm run db:migrate` | Run only migration files (create tables) |
| `npm run db:seed` | Run only seed files (insert sample data) |
| `npm run db:reset` | **⚠️ DANGER:** Drop all tables, then migrate and seed |
| `npm run db:fresh` | **⚠️ DANGER:** Drop all tables, then migrate only |
| `npm run db:stats` | Display table row counts |

## 🌱 Default Categories

When a new user registers, 8 default categories are automatically created:

1. **Groceries** 🛒 - Green (#10B981)
2. **Dining** 🍽️ - Amber (#F59E0B)
3. **Transportation** 🚗 - Blue (#3B82F6)
4. **Entertainment** 🎬 - Purple (#8B5CF6)
5. **Shopping** 🛍️ - Pink (#EC4899)
6. **Utilities** ⚡ - Indigo (#6366F1)
7. **Healthcare** ❤️ - Red (#EF4444)
8. **Other** 📁 - Gray (#6B7280)

## 🔧 Troubleshooting

### Connection Refused Error

```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Start PostgreSQL if not running
brew services start postgresql@14  # macOS
sudo systemctl start postgresql  # Linux
```

### Authentication Failed Error

```bash
# Reset postgres user password
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
\q

# Update DATABASE_URL in .env with new password
```

### Database Does Not Exist

```bash
# Create the database
createdb budget_tracker_db

# Or using psql
psql -U postgres -c "CREATE DATABASE budget_tracker_db;"
```

### Permission Denied

```bash
# Grant privileges to your user
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE budget_tracker_db TO your_username;
\q
```

## 📝 Next Steps

After successful database setup:

1. ✅ Database created and configured
2. ✅ Tables created with proper relationships
3. ✅ Indexes created for performance
4. ✅ Default categories function ready

**You can now:**
- Start building API endpoints
- Implement user authentication
- Create transaction management features
- Build budget tracking functionality

## 🔗 Useful PostgreSQL Commands

```bash
# Connect to database
psql budget_tracker_db

# List all databases
\l

# List all tables
\dt

# Describe a table
\d table_name

# View table data
SELECT * FROM users;

# Exit psql
\q
```

## 📚 Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [node-postgres Documentation](https://node-postgres.com/)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

**Need Help?** Check the `server/src/database/README.md` for more detailed information about the database schema and queries.

