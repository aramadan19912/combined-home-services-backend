#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING FRONTEND CONTAINER CONFIG ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices || exit 1

echo "Step 1: Stopping and removing old frontend container..."
docker stop homeservices_frontend_1 2>/dev/null
docker rm -f homeservices_frontend_1 2>/dev/null
echo "✅ Old container removed"
echo ""

echo "Step 2: Removing old frontend image..."
docker rmi -f homeservices_frontend 2>/dev/null
echo "✅ Old image removed"
echo ""

echo "Step 3: Building fresh frontend image..."
docker-compose build --no-cache frontend
echo "✅ Image built"
echo ""

echo "Step 4: Starting frontend container..."
docker-compose up -d frontend
echo "✅ Container started"
echo ""

echo "Step 5: Waiting 20 seconds for startup..."
sleep 20
echo ""

echo "Step 6: Checking status..."
docker ps | grep frontend
echo ""

echo "Step 7: Frontend logs (last 20 lines)..."
docker logs homeservices_frontend_1 --tail 20 2>&1
echo ""

echo "Step 8: Testing frontend..."
curl -s -o /dev/null -w "Frontend container: HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Through Nginx: HTTP %{http_code}\n" http://localhost/
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DONE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Try accessing:"
echo "   http://72.60.234.126"
echo ""
