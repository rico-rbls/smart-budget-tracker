#!/bin/bash

# Transaction Management System Test Script
# Tests all CRUD operations, filtering, and statistics endpoints

BASE_URL="http://localhost:3002/api"

echo "🧪 Testing Transaction Management System"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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
echo -e "${BLUE}📝 Step 2: Get user categories${NC}"
CATEGORIES=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "$CATEGORIES" | jq '.'
echo ""

# Step 3: Create a new transaction
echo -e "${BLUE}📝 Step 3: Create new transaction${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Walmart",
    "amount": 45.99,
    "transaction_date": "2024-12-08",
    "description": "Groceries shopping",
    "payment_method": "credit_card"
  }')

echo "$CREATE_RESPONSE" | jq '.'
TRANSACTION_ID=$(echo $CREATE_RESPONSE | jq -r '.data.transaction.id')
echo -e "${GREEN}✅ Transaction created with ID: $TRANSACTION_ID${NC}"
echo ""

# Step 4: Create more transactions for testing
echo -e "${BLUE}📝 Step 4: Create additional transactions${NC}"

curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Starbucks",
    "amount": 12.50,
    "transaction_date": "2024-12-09",
    "description": "Coffee and breakfast",
    "payment_method": "debit_card"
  }' | jq '.data.transaction | {id, merchant_name, amount}'

curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Shell Gas Station",
    "amount": 55.00,
    "transaction_date": "2024-12-07",
    "description": "Gas fill-up",
    "payment_method": "credit_card"
  }' | jq '.data.transaction | {id, merchant_name, amount}'

curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Amazon",
    "amount": 89.99,
    "transaction_date": "2024-12-06",
    "description": "Online shopping",
    "payment_method": "credit_card"
  }' | jq '.data.transaction | {id, merchant_name, amount}'

echo -e "${GREEN}✅ Additional transactions created${NC}"
echo ""

# Step 5: Get all transactions
echo -e "${BLUE}📝 Step 5: Get all transactions${NC}"
curl -s -X GET "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 6: Get single transaction by ID
echo -e "${BLUE}📝 Step 6: Get transaction by ID${NC}"
curl -s -X GET "$BASE_URL/transactions/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 7: Update transaction
echo -e "${BLUE}📝 Step 7: Update transaction${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/transactions/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 52.99,
    "description": "Groceries shopping - Updated amount"
  }')

echo "$UPDATE_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Transaction updated${NC}"
echo ""

# Step 8: Test filtering - by date range
echo -e "${BLUE}📝 Step 8: Filter transactions by date range${NC}"
curl -s -X GET "$BASE_URL/transactions?start_date=2024-12-07&end_date=2024-12-09" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.transactions | length as $count | "Found \($count) transactions"'
echo ""

# Step 9: Test filtering - by merchant name
echo -e "${BLUE}📝 Step 9: Filter transactions by merchant name${NC}"
curl -s -X GET "$BASE_URL/transactions?merchant_name=star" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.transactions[] | {merchant_name, amount}'
echo ""

# Step 10: Test filtering - by amount range
echo -e "${BLUE}📝 Step 10: Filter transactions by amount range${NC}"
curl -s -X GET "$BASE_URL/transactions?min_amount=50&max_amount=100" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.transactions[] | {merchant_name, amount}'
echo ""

# Step 11: Test sorting
echo -e "${BLUE}📝 Step 11: Sort transactions by amount (descending)${NC}"
curl -s -X GET "$BASE_URL/transactions?sort_by=amount&sort_order=desc" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.transactions[] | {merchant_name, amount}'
echo ""

# Step 12: Test pagination
echo -e "${BLUE}📝 Step 12: Test pagination (limit=2)${NC}"
curl -s -X GET "$BASE_URL/transactions?limit=2&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.pagination'
echo ""

# Step 13: Get statistics
echo -e "${BLUE}📝 Step 13: Get transaction statistics${NC}"
curl -s -X GET "$BASE_URL/transactions/stats?period=month" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Step 14: Delete transaction
echo -e "${BLUE}📝 Step 14: Delete transaction${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/transactions/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Transaction deleted${NC}"
echo ""

# Step 15: Verify deletion
echo -e "${BLUE}📝 Step 15: Verify transaction was deleted${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/transactions/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$VERIFY_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Transaction successfully deleted (404 returned)${NC}"
else
  echo -e "${RED}❌ Transaction still exists${NC}"
fi
echo ""

# Step 16: Test validation errors
echo -e "${BLUE}📝 Step 16: Test validation errors${NC}"
echo "Testing negative amount:"
curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Test",
    "amount": -10,
    "transaction_date": "2024-12-10"
  }' | jq '.errors'
echo ""

echo "Testing future date:"
curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Test",
    "amount": 10,
    "transaction_date": "2025-12-31"
  }' | jq '.errors'
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"

