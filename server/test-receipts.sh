#!/bin/bash

# Test script for receipt upload and OCR functionality
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Receipt Upload & OCR Test Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Login to get token
echo -e "${YELLOW}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPass123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Please make sure testuser@example.com exists.${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create a test receipt image
echo -e "${YELLOW}Step 2: Creating test receipt image...${NC}"

# Create a simple text-based receipt image using ImageMagick (if available)
# If ImageMagick is not available, we'll skip this test
if command -v convert &> /dev/null; then
  TEST_IMAGE="test-receipt.png"
  
  # Create a simple receipt-like image
  convert -size 400x600 xc:white \
    -font Helvetica -pointsize 24 -fill black \
    -annotate +50+50 "WALMART" \
    -pointsize 16 \
    -annotate +50+100 "Store #1234" \
    -annotate +50+130 "123 Main St" \
    -annotate +50+160 "Date: 12/10/2024" \
    -annotate +50+200 "Items:" \
    -annotate +50+230 "Milk           \$3.99" \
    -annotate +50+260 "Bread          \$2.49" \
    -annotate +50+290 "Eggs           \$4.99" \
    -annotate +50+340 "Subtotal      \$11.47" \
    -annotate +50+370 "Tax            \$0.92" \
    -annotate +50+400 "TOTAL         \$12.39" \
    -annotate +50+450 "Thank you!" \
    "$TEST_IMAGE" 2>/dev/null
  
  if [ -f "$TEST_IMAGE" ]; then
    echo -e "${GREEN}✅ Test receipt image created: $TEST_IMAGE${NC}"
  else
    echo -e "${YELLOW}⚠️  Could not create test image. Will skip upload test.${NC}"
    TEST_IMAGE=""
  fi
else
  echo -e "${YELLOW}⚠️  ImageMagick not found. Skipping image creation.${NC}"
  echo -e "${YELLOW}   To test upload, please provide a receipt image manually.${NC}"
  TEST_IMAGE=""
fi
echo ""

# Step 3: Upload receipt (if we have a test image)
if [ -n "$TEST_IMAGE" ] && [ -f "$TEST_IMAGE" ]; then
  echo -e "${YELLOW}Step 3: Uploading receipt...${NC}"
  
  UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/receipts/upload" \
    -H "Authorization: Bearer $TOKEN" \
    -F "receipt=@$TEST_IMAGE")
  
  echo "Response:"
  echo "$UPLOAD_RESPONSE" | jq '.'
  
  RECEIPT_ID=$(echo $UPLOAD_RESPONSE | jq -r '.data.receipt.id')
  
  if [ "$RECEIPT_ID" != "null" ] && [ -n "$RECEIPT_ID" ]; then
    echo -e "${GREEN}✅ Receipt uploaded successfully (ID: $RECEIPT_ID)${NC}"
  else
    echo -e "${RED}❌ Receipt upload failed${NC}"
  fi
  echo ""
  
  # Wait for OCR processing
  echo -e "${YELLOW}⏳ Waiting 5 seconds for OCR processing...${NC}"
  sleep 5
  echo ""
else
  echo -e "${YELLOW}Step 3: Skipping upload test (no test image)${NC}"
  echo ""
  RECEIPT_ID=""
fi

# Step 4: Get all receipts
echo -e "${YELLOW}Step 4: Getting all receipts...${NC}"
RECEIPTS_RESPONSE=$(curl -s -X GET "$API_URL/receipts" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RECEIPTS_RESPONSE" | jq '.'
echo ""

# Step 5: Get specific receipt (if we uploaded one)
if [ -n "$RECEIPT_ID" ] && [ "$RECEIPT_ID" != "null" ]; then
  echo -e "${YELLOW}Step 5: Getting receipt by ID ($RECEIPT_ID)...${NC}"
  
  RECEIPT_RESPONSE=$(curl -s -X GET "$API_URL/receipts/$RECEIPT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response:"
  echo "$RECEIPT_RESPONSE" | jq '.'
  
  # Check if OCR was processed
  PROCESSED=$(echo $RECEIPT_RESPONSE | jq -r '.data.receipt.processed')
  OCR_TEXT=$(echo $RECEIPT_RESPONSE | jq -r '.data.receipt.ocr_text')
  
  if [ "$PROCESSED" == "true" ]; then
    echo -e "${GREEN}✅ Receipt processed${NC}"
    if [ "$OCR_TEXT" != "null" ] && [ -n "$OCR_TEXT" ]; then
      echo -e "${GREEN}✅ OCR text extracted (${#OCR_TEXT} characters)${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  Receipt not yet processed${NC}"
  fi
  echo ""
fi

# Step 6: Test error cases
echo -e "${YELLOW}Step 6: Testing error cases...${NC}"

# Test 6a: Upload without token
echo -e "${BLUE}Test 6a: Upload without authentication${NC}"
NO_AUTH_RESPONSE=$(curl -s -X POST "$API_URL/receipts/upload" \
  -F "receipt=@test-receipt.png" 2>/dev/null)
echo "$NO_AUTH_RESPONSE" | jq '.'
echo ""

# Test 6b: Get receipt without token
echo -e "${BLUE}Test 6b: Get receipts without authentication${NC}"
NO_AUTH_GET=$(curl -s -X GET "$API_URL/receipts" 2>/dev/null)
echo "$NO_AUTH_GET" | jq '.'
echo ""

# Step 7: Delete receipt (if we uploaded one)
if [ -n "$RECEIPT_ID" ] && [ "$RECEIPT_ID" != "null" ]; then
  echo -e "${YELLOW}Step 7: Deleting receipt ($RECEIPT_ID)...${NC}"
  
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/receipts/$RECEIPT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response:"
  echo "$DELETE_RESPONSE" | jq '.'
  
  SUCCESS=$(echo $DELETE_RESPONSE | jq -r '.success')
  if [ "$SUCCESS" == "true" ]; then
    echo -e "${GREEN}✅ Receipt deleted successfully${NC}"
  else
    echo -e "${RED}❌ Receipt deletion failed${NC}"
  fi
  echo ""
fi

# Cleanup
if [ -f "$TEST_IMAGE" ]; then
  rm "$TEST_IMAGE"
  echo -e "${GREEN}🧹 Cleaned up test image${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Complete!${NC}"
echo -e "${BLUE}========================================${NC}"

