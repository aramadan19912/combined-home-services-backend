#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 STARTING FRONTEND WITH RAW DOCKER (BYPASSING DOCKER-COMPOSE)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices || exit 1

echo "Step 1: Force remove ALL frontend containers and images..."
docker stop homeservices_frontend_1 2>/dev/null
docker rm -f homeservices_frontend_1 2>/dev/null
docker rm -f $(docker ps -a | grep frontend | awk '{print $1}') 2>/dev/null
docker rmi -f homeservices_frontend 2>/dev/null
docker rmi -f $(docker images | grep frontend | awk '{print $3}') 2>/dev/null
echo "✅ Cleanup complete"
echo ""

echo "Step 2: Building frontend image with Docker (not compose)..."
cd frontend
docker build --no-cache \
  --build-arg VITE_API_BASE_URL=http://72.60.234.126/api \
  --build-arg VITE_API_HOST_URL=http://72.60.234.126/api \
  --build-arg VITE_AUTH_API_BASE_URL=http://72.60.234.126/api \
  -t homeservices_frontend:latest .
cd ..
echo "✅ Image built"
echo ""

echo "Step 3: Starting container with raw Docker command..."
docker run -d \
  --name homeservices_frontend_1 \
  --network homeservices_app-network \
  -p 3000:8080 \
  --restart unless-stopped \
  homeservices_frontend:latest
echo "✅ Container started"
echo ""

echo "Step 4: Waiting 15 seconds..."
sleep 15
echo ""

echo "Step 5: Container status..."
docker ps | grep frontend
echo ""

echo "Step 6: Container logs..."
docker logs homeservices_frontend_1 --tail 20
echo ""

echo "Step 7: Testing..."
curl -s -o /dev/null -w "Frontend (port 3000): HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Through Nginx (port 80): HTTP %{http_code}\n" http://localhost/
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FRONTEND STARTED WITH RAW DOCKER!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Now try accessing:"
echo "   http://72.60.234.126"
echo ""
echo "If you see the frontend, you're done! 🎉"
echo ""
