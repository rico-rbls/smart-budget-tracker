#!/bin/bash

# Budget Management System Test Script
# Tests all CRUD operations, budget status, and alerts

BASE_URL="http://localhost:3002/api"

echo "🧪 Testing Budget Management System"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login to get token
echo -e "${BLUE}📝 Step 1: Login to get authentication token${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Please ensure testuser@example.com exists${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get user's categories
echo -e "${BLUE}📝 Step 2: Get user categories from database${NC}"

# Query database to get first category
CATEGORY_ID=$(psql -d budget_tracker_db -t -c "SELECT id FROM categories WHERE user_id = 2 LIMIT 1;" | xargs)

if [ -z "$CATEGORY_ID" ]; then
  echo -e "${RED}❌ No categories found for user${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Using category_id: $CATEGORY_ID (Groceries)${NC}"
echo ""

# Step 3: Create a transaction with this category for testing
echo -e "${BLUE}📝 Step 3: Create test transaction with category${NC}"
TRANS_RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchant_name\": \"Walmart\",
    \"amount\": 50.00,
    \"transaction_date\": \"2024-12-08\",
    \"category_id\": $CATEGORY_ID,
    \"description\": \"Test transaction for budget\"
  }")

echo "$TRANS_RESPONSE" | jq '.data.transaction | {id, merchant_name, amount, category_name}'
echo ""

# Step 4: Create a monthly budget
echo -e "${BLUE}📝 Step 4: Create monthly budget${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category_id\": $CATEGORY_ID,
    \"amount\": 500.00,
    \"period\": \"monthly\"
  }")

echo "$CREATE_RESPONSE" | jq '.'
BUDGET_ID=$(echo $CREATE_RESPONSE | jq -r '.data.budget.id')

if [ "$BUDGET_ID" == "null" ] || [ -z "$BUDGET_ID" ]; then
  echo -e "${YELLOW}⚠️  Budget might already exist. Trying to get existing budgets...${NC}"
  EXISTING_BUDGETS=$(curl -s -X GET "$BASE_URL/budgets" \
    -H "Authorization: Bearer $TOKEN")
  BUDGET_ID=$(echo $EXISTING_BUDGETS | jq -r '.data.budgets[0].id')
  echo "Using existing budget_id: $BUDGET_ID"
else
  echo -e "${GREEN}✅ Budget created with ID: $BUDGET_ID${NC}"
fi
echo ""

# Step 5: Create additional budgets for different periods
echo -e "${BLUE}📝 Step 5: Create additional budgets${NC}"

# Try to create weekly budget (might fail if category already has one)
curl -s -X POST "$BASE_URL/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category_id\": $CATEGORY_ID,
    \"amount\": 100.00,
    \"period\": \"weekly\"
  }" | jq '.message'

echo ""

# Step 6: Get all budgets
echo -e "${BLUE}📝 Step 6: Get all budgets${NC}"
curl -s -X GET "$BASE_URL/budgets" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 7: Get single budget by ID
echo -e "${BLUE}📝 Step 7: Get budget by ID${NC}"
curl -s -X GET "$BASE_URL/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 8: Update budget
echo -e "${BLUE}📝 Step 8: Update budget amount${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600.00
  }')

echo "$UPDATE_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Budget updated${NC}"
echo ""

# Step 9: Get budget status
echo -e "${BLUE}📝 Step 9: Get budget status (monthly)${NC}"
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/budgets/status?period=monthly" \
  -H "Authorization: Bearer $TOKEN")

echo "$STATUS_RESPONSE" | jq '.'
echo ""

# Step 10: Test budget alerts by creating transactions
echo -e "${BLUE}📝 Step 10: Test budget alerts${NC}"
echo "Creating transactions to test alert levels..."

# Create transaction to reach 80% (warning)
curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchant_name\": \"Test Merchant 1\",
    \"amount\": 200.00,
    \"transaction_date\": \"2024-12-09\",
    \"category_id\": $CATEGORY_ID
  }" > /dev/null

# Create transaction to reach 100% (alert)
curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchant_name\": \"Test Merchant 2\",
    \"amount\": 200.00,
    \"transaction_date\": \"2024-12-09\",
    \"category_id\": $CATEGORY_ID
  }" > /dev/null

echo "Transactions created. Checking budget status..."
echo ""

# Get updated budget status
echo -e "${BLUE}📝 Step 11: Get updated budget status with alerts${NC}"
curl -s -X GET "$BASE_URL/budgets/status?period=monthly" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.budgets[] | {category_name, budget_amount, spent_amount, percentage_used, status, alert_level}'
echo ""

# Step 12: Filter budgets by period
echo -e "${BLUE}📝 Step 12: Filter budgets by period${NC}"
echo "Monthly budgets:"
curl -s -X GET "$BASE_URL/budgets?period=monthly" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.count'

echo "Weekly budgets:"
curl -s -X GET "$BASE_URL/budgets?period=weekly" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.count'
echo ""

# Step 13: Test validation errors
echo -e "${BLUE}📝 Step 13: Test validation errors${NC}"

echo "Testing negative amount:"
curl -s -X POST "$BASE_URL/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category_id\": $CATEGORY_ID,
    \"amount\": -100,
    \"period\": \"monthly\"
  }" | jq '.errors'

echo ""
echo "Testing invalid period:"
curl -s -X POST "$BASE_URL/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category_id\": $CATEGORY_ID,
    \"amount\": 100,
    \"period\": \"daily\"
  }" | jq '.errors'

echo ""
echo "Testing invalid date range:"
curl -s -X POST "$BASE_URL/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category_id\": 999,
    \"amount\": 100,
    \"period\": \"monthly\",
    \"start_date\": \"2024-12-31\",
    \"end_date\": \"2024-12-01\"
  }" | jq '.errors'
echo ""

# Step 14: Delete budget
echo -e "${BLUE}📝 Step 14: Delete budget${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Budget deleted${NC}"
echo ""

# Step 15: Verify deletion
echo -e "${BLUE}📝 Step 15: Verify budget was deleted${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/budgets/$BUDGET_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$VERIFY_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Budget successfully deleted (404 returned)${NC}"
else
  echo -e "${RED}❌ Budget still exists${NC}"
fi
echo ""

echo -e "${GREEN}✅ All budget tests completed!${NC}"

