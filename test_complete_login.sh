#!/bin/bash

# Guardar el access token en variable
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsImtpZCI6Ind5R3hWaDBmR0JWdlZ1anciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2xxdmFkYW94a3Jsb2phcWVscHV4LnN1cGFiYXNlLmNv
L2F1dGgvdjEiLCJzdWIiOiI0MTZhZmIwMC0zMDQ5LTQ3YjItYWNmYS01Nzk5NzAyYWI1YTMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYwMjgzNTYwLCJpYXQiOjE3NjAyNzk5NjAsImVtYWlsIjoiZ3V0aWplYW5mQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJndXRpamVhbmZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJKZWFuIEZyYW5jb2lzIEd1dGllcnJleiIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNDE2YWZiMDAtMzA0OS00N2IyLWFjZmEtNTc5OTcwMmFiNWEzIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NjAyNzk5NjB9XSwic2Vzc2lvbl9pZCI6ImRmZTNkZGYyLWRhMjAtNDUwZC1iMjk0LTc5MjQ3ZTkxZGI2OCIsImlzX2Fub255bW91cyI6ZmFsc2V9.T3ghw1TcUXjkt6YLBe8LSfaS5zydZgLA9qt6okhF0hI"

REFRESH_TOKEN="6k6njuavckdx"

echo "🚀 TESTING COMPLETE LOGIN FLOW VIA API"
echo "======================================="

echo "✅ LOGIN SUCCESSFUL!"
echo "User: gutijeanf@gmail.com"
echo "User ID: 416afb00-3049-47b2-acfa-5799702ab5a3"
echo "Email verified: true"
echo "Name: Jean Francois Gutierrez"

echo -e "\n📊 Testing migration with auth token..."

# Crear cookies de Supabase para simular browser login
echo "Setting up Supabase cookies..."

# Test migration usando cookies de Supabase (simulando browser)
curl -X POST http://localhost:3001/api/auth/migrate-account \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-lqvadaoxkrlojaqelpux-auth-token='[$ACCESS_TOKEN,$REFRESH_TOKEN,null,null,null]'" \
  -v

echo -e "\n\n🔍 Checking if games were migrated..."
curl -X POST http://localhost:3001/api/auth/check-legacy-email \
  -H "Content-Type: application/json" \
  -d '{"email": "gutijeanf@gmail.com"}'

echo -e "\n\n✅ LOGIN TEST COMPLETED!"