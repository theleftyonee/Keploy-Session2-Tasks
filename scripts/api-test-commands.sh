#!/bin/bash

# StudentHub Dashboard API Testing Script
# This script contains curl commands for testing all API endpoints

set -e

# Configuration
BASE_URL="http://localhost:3000"
if [ ! -z "$1" ]; then
    BASE_URL="$1"
fi

echo "🚀 StudentHub Dashboard API Testing"
echo "Base URL: $BASE_URL"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    else
        echo "Data: $data"
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all but last line)
    response_body=$(echo "$response" | head -n -1)
    
    echo "Response Status: $status_code"
    echo "Response Body: $response_body"
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        echo -e "${RED}❌ FAILED - Expected: $expected_status, Got: $status_code${NC}"
    fi
    
    echo "---"
}

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
timeout 30 bash -c 'until curl -f '$BASE_URL' >/dev/null 2>&1; do sleep 1; done' || {
    echo -e "${RED}❌ Server is not responding at $BASE_URL${NC}"
    exit 1
}
echo -e "${GREEN}✅ Server is ready${NC}"

# Test 1: Get all students
test_endpoint "GET" "/api/students" "" 200 "Get all students"

# Test 2: Create a new student
test_endpoint "POST" "/api/students" \
    '{"name":"API Test Student","age":22,"course":"Computer Science"}' \
    201 "Create new student"

# Test 3: Create student with invalid data (empty name)
test_endpoint "POST" "/api/students" \
    '{"name":"","age":22,"course":"Computer Science"}' \
    400 "Create student with invalid data (empty name)"

# Test 4: Create student with invalid age
test_endpoint "POST" "/api/students" \
    '{"name":"Test Student","age":0,"course":"Computer Science"}' \
    400 "Create student with invalid age"

# Test 5: Create student with invalid course
test_endpoint "POST" "/api/students" \
    '{"name":"Test Student","age":22,"course":"Invalid Course"}' \
    400 "Create student with invalid course"

# Test 6: Search students by name
test_endpoint "GET" "/api/students/search?q=API" "" 200 "Search students by name"

# Test 7: Search students by course
test_endpoint "GET" "/api/students/search?course=Computer%20Science" "" 200 "Search students by course"

# Test 8: Search with multiple parameters
test_endpoint "GET" "/api/students/search?q=Test&course=Computer%20Science&min_age=20&max_age=25" "" 200 "Search with multiple parameters"

# Test 9: Get analytics overview
test_endpoint "GET" "/api/analytics/overview" "" 200 "Get analytics overview"

# Test 10: Get course distribution
test_endpoint "GET" "/api/analytics/courses" "" 200 "Get course distribution"

# Test 11: Get age group distribution
test_endpoint "GET" "/api/analytics/age-groups" "" 200 "Get age group distribution"

# Test 12: Test non-existent endpoint
test_endpoint "GET" "/api/nonexistent" "" 404 "Test non-existent endpoint"

# Test 13: Test malformed JSON
echo -e "\n${BLUE}Testing: Malformed JSON${NC}"
echo "Method: POST"
echo "Endpoint: /api/students"
echo "Data: {invalid json}"

response=$(curl -s -w "\n%{http_code}" -X "POST" \
    -H "Content-Type: application/json" \
    -d '{invalid json}' \
    "$BASE_URL/api/students" 2>/dev/null || echo -e "\n400")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "Response Status: $status_code"
echo "Response Body: $response_body"

if [ "$status_code" -eq "400" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
else
    echo -e "${RED}❌ FAILED - Expected: 400, Got: $status_code${NC}"
fi

echo "---"

# Performance test - concurrent requests
echo -e "\n${YELLOW}🔄 Performance Testing - Concurrent Requests${NC}"
echo "Running 10 concurrent GET requests..."

start_time=$(date +%s.%N)

for i in {1..10}; do
    curl -s "$BASE_URL/api/students" > /dev/null &
done

wait

end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)

echo "Total time for 10 concurrent requests: ${duration}s"
echo -e "${GREEN}✅ Performance test completed${NC}"

# Security tests
echo -e "\n${YELLOW}🔒 Security Testing${NC}"

# Test SQL injection
echo "Testing SQL injection protection..."
test_endpoint "GET" "/api/students/search?q='; DROP TABLE students; --" "" 200 "SQL injection test"

# Test XSS
echo "Testing XSS protection..."
test_endpoint "POST" "/api/students" \
    '{"name":"<script>alert(\"xss\")</script>","age":21,"course":"Computer Science"}' \
    400 "XSS protection test"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "=================================="
