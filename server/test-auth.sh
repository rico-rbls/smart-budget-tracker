#!/bin/bash

# Authentication API Test Script
# This script tests the authentication endpoints

API_URL="http://localhost:3001/api"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BOLD}🧪 Testing Smart Budget Tracker Authentication API${NC}\n"

# Test 1: Register a new user
echo -e "${BLUE}Test 1: Register a new user${NC}"
echo "POST $API_URL/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extract token from registration
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token // empty')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Registration successful${NC}\n"
else
  echo -e "${RED}❌ Registration failed${NC}\n"
fi

# Test 2: Try to register with same email (should fail)
echo -e "${BLUE}Test 2: Register with duplicate email (should fail)${NC}"
echo "POST $API_URL/auth/register"
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User 2"
  }')

echo "$DUPLICATE_RESPONSE" | jq '.'

if echo "$DUPLICATE_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Duplicate email correctly rejected${NC}\n"
else
  echo -e "${RED}❌ Duplicate email not rejected${NC}\n"
fi

# Test 3: Register with weak password (should fail)
echo -e "${BLUE}Test 3: Register with weak password (should fail)${NC}"
echo "POST $API_URL/auth/register"
WEAK_PASSWORD_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "password": "weak",
    "name": "Weak User"
  }')

echo "$WEAK_PASSWORD_RESPONSE" | jq '.'

if echo "$WEAK_PASSWORD_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Weak password correctly rejected${NC}\n"
else
  echo -e "${RED}❌ Weak password not rejected${NC}\n"
fi

# Test 4: Login with correct credentials
echo -e "${BLUE}Test 4: Login with correct credentials${NC}"
echo "POST $API_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract token from login
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ -n "$LOGIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}\n"
  TOKEN="$LOGIN_TOKEN"
else
  echo -e "${RED}❌ Login failed${NC}\n"
fi

# Test 5: Login with wrong password (should fail)
echo -e "${BLUE}Test 5: Login with wrong password (should fail)${NC}"
echo "POST $API_URL/auth/login"
WRONG_PASSWORD_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123"
  }')

echo "$WRONG_PASSWORD_RESPONSE" | jq '.'

if echo "$WRONG_PASSWORD_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Wrong password correctly rejected${NC}\n"
else
  echo -e "${RED}❌ Wrong password not rejected${NC}\n"
fi

# Test 6: Get profile with valid token
echo -e "${BLUE}Test 6: Get profile with valid token${NC}"
echo "GET $API_URL/auth/profile"
if [ -n "$TOKEN" ]; then
  PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$PROFILE_RESPONSE" | jq '.'
  
  if echo "$PROFILE_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ Profile retrieved successfully${NC}\n"
  else
    echo -e "${RED}❌ Failed to retrieve profile${NC}\n"
  fi
else
  echo -e "${RED}❌ No token available for testing${NC}\n"
fi

# Test 7: Get profile without token (should fail)
echo -e "${BLUE}Test 7: Get profile without token (should fail)${NC}"
echo "GET $API_URL/auth/profile"
NO_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile")

echo "$NO_TOKEN_RESPONSE" | jq '.'

if echo "$NO_TOKEN_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ No token correctly rejected${NC}\n"
else
  echo -e "${RED}❌ No token not rejected${NC}\n"
fi

# Test 8: Get profile with invalid token (should fail)
echo -e "${BLUE}Test 8: Get profile with invalid token (should fail)${NC}"
echo "GET $API_URL/auth/profile"
INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer invalid.token.here")

echo "$INVALID_TOKEN_RESPONSE" | jq '.'

if echo "$INVALID_TOKEN_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo -e "${GREEN}✅ Invalid token correctly rejected${NC}\n"
else
  echo -e "${RED}❌ Invalid token not rejected${NC}\n"
fi

echo -e "${BOLD}🎉 Authentication API tests completed!${NC}"

