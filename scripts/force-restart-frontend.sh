#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Force Restart Frontend - Cleaning up conflicts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices

# Step 1: Show current container status
echo "📊 Current container status:"
docker ps -a --filter "name=frontend" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 2: Force remove the conflicting container
echo "🧹 Removing conflicting frontend container..."
docker stop homeservices_frontend_1 2>/dev/null || true
docker rm -f homeservices_frontend_1 2>/dev/null || true
docker rm -f bc9e5c476367a7fb2aee610f8376d8fbd204db8fb76747d2023674a0b8f32c99 2>/dev/null || true
echo "✅ Cleaned up old containers"
echo ""

# Step 3: Check which docker-compose file to use
echo "📁 Checking docker-compose files..."
if [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    COMPOSE_CMD="docker-compose -f docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.yml"
    COMPOSE_CMD="docker-compose"
fi
echo "Using: $COMPOSE_FILE"
echo ""

# Step 4: Bring down all services cleanly
echo "🛑 Bringing down all services..."
$COMPOSE_CMD down
echo ""

# Step 5: Remove any orphaned containers
echo "🧹 Removing orphaned containers..."
docker container prune -f
echo ""

# Step 6: Start all services fresh
echo "🚀 Starting all services..."
$COMPOSE_CMD up -d
echo ""

# Step 7: Wait for services to start
echo "⏳ Waiting for services to start (20 seconds)..."
sleep 20
echo ""

# Step 8: Show running containers
echo "📊 Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 9: Check frontend logs
echo "📋 Frontend logs:"
docker logs homeservices_frontend_1 --tail 30 2>&1 || docker logs frontend 2>&1 --tail 30 || echo "Frontend logs not available"
echo ""

# Step 10: Test endpoints
echo "🧪 Testing endpoints..."
curl -s -o /dev/null -w "Frontend (port 3000):      HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "API (port 8080):           HTTP %{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "Frontend (port 80):        HTTP %{http_code}\n" http://localhost/
curl -s -o /dev/null -w "API (port 80/api):         HTTP %{http_code}\n" http://localhost/api/
curl -s -o /dev/null -w "Swagger (port 80/swagger): HTTP %{http_code}\n" http://localhost/swagger/
echo ""

# Step 11: If frontend still not working, try direct docker run
if ! curl -s -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "⚠️  Frontend still not responding, trying direct docker run..."
    
    # Stop the service first
    $COMPOSE_CMD stop frontend 2>/dev/null || true
    docker stop homeservices_frontend_1 2>/dev/null || true
    docker rm -f homeservices_frontend_1 2>/dev/null || true
    
    # Run directly
    echo "Starting frontend with direct docker run..."
    docker run -d \
        --name homeservices_frontend_1 \
        --network homeservices_app-network \
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
    
    echo "Waiting 10 seconds..."
    sleep 10
    
    echo "Testing again..."
    curl -s -o /dev/null -w "Frontend (port 3000): HTTP %{http_code}\n" http://localhost:3000/
    curl -s -o /dev/null -w "Frontend (port 80):   HTTP %{http_code}\n" http://localhost/
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Force restart completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Try accessing: http://72.60.234.126"
echo ""
echo "If still having issues:"
echo "1. Check all logs: docker logs homeservices_frontend_1"
echo "2. Check images: docker images | grep frontend"
echo "3. Check networks: docker network ls"
echo ""