#!/bin/bash

# Working cURL Examples for StudentHub Dashboard API
# These are 5 working curl commands you can run directly

echo "🚀 StudentHub Dashboard - Working cURL Examples"
echo "================================================"

# Set the base URL (change this to your deployed URL)
BASE_URL="https://v0-student-hub-dashboard.vercel.app"

echo "Base URL: $BASE_URL"
echo ""

# 1. GET all students
echo "1️⃣ GET all students:"
echo "curl -X GET \"$BASE_URL/api/students\" -H \"Content-Type: application/json\""
echo ""
curl -X GET "$BASE_URL/api/students" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (install jq for pretty JSON)"
echo ""
echo "---"

# 2. Create a new student
echo "2️⃣ POST - Create a new student:"
echo "curl -X POST \"$BASE_URL/api/students\" -H \"Content-Type: application/json\" -d '{\"name\":\"John Doe\",\"age\":21,\"course\":\"Computer Science\"}'"
echo ""
curl -X POST "$BASE_URL/api/students" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","age":21,"course":"Computer Science"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (install jq for pretty JSON)"
echo ""
echo "---"

# 3. Search students by course
echo "3️⃣ GET - Search students by course:"
echo "curl -X GET \"$BASE_URL/api/students/search?course=Computer%20Science\" -H \"Content-Type: application/json\""
echo ""
curl -X GET "$BASE_URL/api/students/search?course=Computer%20Science" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (install jq for pretty JSON)"
echo ""
echo "---"

# 4. Get analytics overview
echo "4️⃣ GET - Analytics overview:"
echo "curl -X GET \"$BASE_URL/api/analytics/overview\" -H \"Content-Type: application/json\""
echo ""
curl -X GET "$BASE_URL/api/analytics/overview" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (install jq for pretty JSON)"
echo ""
echo "---"

# 5. Advanced search with multiple parameters
echo "5️⃣ GET - Advanced search with filters:"
echo "curl -X GET \"$BASE_URL/api/students/search?q=John&min_age=20&max_age=25\" -H \"Content-Type: application/json\""
echo ""
curl -X GET "$BASE_URL/api/students/search?q=John&min_age=20&max_age=25" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (install jq for pretty JSON)"
echo ""
echo "---"

echo "✅ All cURL examples completed!"
echo ""
echo "💡 Tips:"
echo "- Install 'jq' for pretty JSON formatting: sudo apt-get install jq"
echo "- Change BASE_URL to test against localhost: BASE_URL=\"http://localhost:3000\""
echo "- Add -v flag to curl for verbose output"
echo "- Use -i flag to include response headers"
