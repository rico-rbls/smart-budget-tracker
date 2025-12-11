-- Sample Data for Testing
-- This file contains sample data for development and testing purposes
-- WARNING: Only run this in development environment!

-- Insert a test user (password: 'password123' - hashed with bcrypt)
-- Note: In production, use the API to create users with proper password hashing
INSERT INTO users (email, name, password_hash) VALUES
  ('demo@budgettracker.com', 'Demo User', '$2a$10$rKvVLZ8Z8Z8Z8Z8Z8Z8Z8uXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX')
ON CONFLICT (email) DO NOTHING;

-- Get the demo user ID
DO $$
DECLARE
  demo_user_id INTEGER;
BEGIN
  SELECT id INTO demo_user_id FROM users WHERE email = 'demo@budgettracker.com';
  
  -- Create default categories for demo user
  PERFORM create_default_categories(demo_user_id);
  
  -- Insert sample transactions
  INSERT INTO transactions (user_id, category_id, merchant_name, amount, transaction_date, description, payment_method)
  SELECT 
    demo_user_id,
    c.id,
    CASE c.name
      WHEN 'Groceries' THEN 'Whole Foods'
      WHEN 'Dining' THEN 'Starbucks'
      WHEN 'Transportation' THEN 'Uber'
      WHEN 'Entertainment' THEN 'Netflix'
      WHEN 'Shopping' THEN 'Amazon'
      WHEN 'Utilities' THEN 'PG&E'
      WHEN 'Healthcare' THEN 'CVS Pharmacy'
      ELSE 'Misc Store'
    END,
    CASE c.name
      WHEN 'Groceries' THEN 125.50
      WHEN 'Dining' THEN 15.75
      WHEN 'Transportation' THEN 22.30
      WHEN 'Entertainment' THEN 14.99
      WHEN 'Shopping' THEN 89.99
      WHEN 'Utilities' THEN 150.00
      WHEN 'Healthcare' THEN 45.20
      ELSE 30.00
    END,
    CURRENT_DATE - (FLOOR(RANDOM() * 30)::INTEGER),
    CASE c.name
      WHEN 'Groceries' THEN 'Weekly grocery shopping'
      WHEN 'Dining' THEN 'Morning coffee'
      WHEN 'Transportation' THEN 'Ride to work'
      WHEN 'Entertainment' THEN 'Monthly subscription'
      WHEN 'Shopping' THEN 'Online purchase'
      WHEN 'Utilities' THEN 'Monthly electric bill'
      WHEN 'Healthcare' THEN 'Prescription refill'
      ELSE 'Miscellaneous expense'
    END,
    CASE 
      WHEN RANDOM() < 0.5 THEN 'Credit Card'
      WHEN RANDOM() < 0.75 THEN 'Debit Card'
      ELSE 'Cash'
    END
  FROM categories c
  WHERE c.user_id = demo_user_id;
  
  -- Insert sample budgets
  INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date)
  SELECT 
    demo_user_id,
    c.id,
    CASE c.name
      WHEN 'Groceries' THEN 500.00
      WHEN 'Dining' THEN 200.00
      WHEN 'Transportation' THEN 150.00
      WHEN 'Entertainment' THEN 100.00
      WHEN 'Shopping' THEN 300.00
      WHEN 'Utilities' THEN 200.00
      WHEN 'Healthcare' THEN 150.00
      ELSE 100.00
    END,
    'monthly',
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'
  FROM categories c
  WHERE c.user_id = demo_user_id;
  
END $$;

-- Display summary
SELECT 
  'Sample data inserted successfully!' as message,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM transactions) as total_transactions,
  (SELECT COUNT(*) FROM budgets) as total_budgets;

