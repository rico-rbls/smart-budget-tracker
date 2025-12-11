-- Default Categories Seed Data
-- This file contains default categories that will be created for new users

-- Note: This is a template. The actual insertion will be done via the application
-- when a new user registers, using the user's ID.

-- Default categories with colors and icons:
-- These will be inserted programmatically for each new user

-- Category Template Data:
-- 1. Groceries - #10B981 (green) - shopping-cart
-- 2. Dining - #F59E0B (amber) - utensils
-- 3. Transportation - #3B82F6 (blue) - car
-- 4. Entertainment - #8B5CF6 (purple) - film
-- 5. Shopping - #EC4899 (pink) - shopping-bag
-- 6. Utilities - #6366F1 (indigo) - bolt
-- 7. Healthcare - #EF4444 (red) - heart
-- 8. Other - #6B7280 (gray) - folder

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

-- Example: To create default categories for a user with id 1:
-- SELECT create_default_categories(1);

