-- ============================================
-- QUICK SETUP SQL SCRIPT
-- ============================================
-- This file can be run directly in psql for manual setup
-- Usage: psql budget_tracker_db < QUICK_SETUP.sql

-- Create database (run this separately if needed)
-- CREATE DATABASE budget_tracker_db;

-- Connect to database
\c budget_tracker_db

-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_default_categories(INTEGER) CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  icon VARCHAR(50) DEFAULT 'folder',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Receipts table
CREATE TABLE receipts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  upload_date TIMESTAMP DEFAULT NOW(),
  ocr_text TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_processed ON receipts(processed);

-- Transactions table
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

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_receipt_id ON transactions(receipt_id);

-- Budgets table
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period);

-- ============================================
-- CREATE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default categories for a user
CREATE OR REPLACE FUNCTION create_default_categories(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon) VALUES
    (p_user_id, 'Groceries', '#10B981', 'shopping-cart'),
    (p_user_id, 'Dining', '#F59E0B', 'utensils'),
    (p_user_id, 'Transportation', '#3B82F6', 'car'),
    (p_user_id, 'Entertainment', '#8B5CF6', 'film'),
    (p_user_id, 'Shopping', '#EC4899', 'shopping-bag'),
    (p_user_id, 'Utilities', '#6366F1', 'bolt'),
    (p_user_id, 'Healthcare', '#EF4444', 'heart'),
    (p_user_id, 'Other', '#6B7280', 'folder');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DISPLAY RESULTS
-- ============================================

\echo '✅ Database schema created successfully!'
\echo ''
\echo '📊 Tables created:'
\dt

\echo ''
\echo '🔧 Functions created:'
\df

\echo ''
\echo '✨ Setup complete! You can now run the application.'

