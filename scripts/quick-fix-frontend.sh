#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ Quick Frontend Fix - Direct Docker Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices

# Step 1: Stop any existing frontend container
echo "🛑 Stopping existing frontend container..."
docker stop homeservices_frontend_1 2>/dev/null
docker rm homeservices_frontend_1 2>/dev/null
echo ""

# Step 2: Login to GitHub Container Registry
echo "🔐 Logging in to GitHub Container Registry..."
echo "$GITHUB_TOKEN" | docker login ghcr.io -u aramadan19912 --password-stdin || echo "Note: Login failed, trying without auth..."
echo ""

# Step 3: Pull the latest frontend image
echo "📥 Pulling latest frontend image..."
docker pull ghcr.io/aramadan19912/combined-home-services-backend/frontend:latest || {
    echo "Failed to pull from registry, building locally..."
    if [ -d "frontend" ]; then
        cd frontend
        docker build -t homeservices_frontend:latest \
            --build-arg VITE_API_BASE_URL=http://72.60.234.126:8080/api \
            --build-arg VITE_API_HOST_URL=http://72.60.234.126:8080/api \
            --build-arg VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api \
            .
        cd ..
    fi
}
echo ""

# Step 4: Start frontend container
echo "🚀 Starting frontend container..."
docker run -d \
    --name homeservices_frontend_1 \
    --restart unless-stopped \
    -p 3000:8080 \
    -e VITE_API_BASE_URL=http://72.60.234.126:8080/api \
    -e VITE_API_HOST_URL=http://72.60.234.126:8080/api \
    -e VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api \
    ghcr.io/aramadan19912/combined-home-services-backend/frontend:latest || \
docker run -d \
    --name homeservices_frontend_1 \
    --restart unless-stopped \
    -p 3000:8080 \
    -e VITE_API_BASE_URL=http://72.60.234.126:8080/api \
    -e VITE_API_HOST_URL=http://72.60.234.126:8080/api \
    -e VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api \
    homeservices_frontend:latest

echo "✅ Frontend container started"
echo ""

# Step 5: Check if it's running
echo "📊 Checking container status..."
docker ps | grep frontend
echo ""

# Step 6: Show logs
echo "📋 Frontend logs:"
docker logs homeservices_frontend_1 --tail 20
echo ""

# Step 7: Test endpoints
echo "🧪 Testing endpoints in 10 seconds..."
sleep 10
curl -s -o /dev/null -w "Frontend (port 3000): HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Frontend (port 80):   HTTP %{http_code}\n" http://localhost/
echo ""

# Step 8: If still not working, check what's on port 3000
echo "🔍 Checking what's listening on port 3000..."
netstat -tlnp | grep :3000 || ss -tlnp | grep :3000
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Quick fix completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Try accessing: http://72.60.234.126"
echo ""