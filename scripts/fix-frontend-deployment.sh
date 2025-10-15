#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing Frontend Deployment Issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check current container status
echo "📊 Step 1: Checking current Docker containers..."
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 2: Check if docker-compose files exist
echo "📁 Step 2: Checking for docker-compose files..."
cd /var/www/homeservices
ls -la docker-compose*.yml
echo ""

# Step 3: Start containers using docker-compose
echo "🚀 Step 3: Starting containers with docker-compose..."
if [ -f "docker-compose.yml" ]; then
    echo "Using docker-compose.yml..."
    docker-compose down
    docker-compose up -d
elif [ -f "docker-compose.prod.yml" ]; then
    echo "Using docker-compose.prod.yml..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
else
    echo "❌ No docker-compose file found!"
    echo ""
    echo "Creating basic docker-compose.yml..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # SQL Server Database
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: homeservices-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password123
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd", "-S", "localhost", "-U", "SA", "-P", "YourStrong@Password123", "-Q", "SELECT 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # API Service
  api:
    image: ghcr.io/aramadan19912/combined-home-services-backend/backend:latest
    container_name: homeservices_api_1
    ports:
      - "8080:8080"
    environment:
      - Database__Provider=SqlServer
      - ConnectionStrings__Default=Server=sqlserver;Database=HomeServices;User Id=SA;Password=YourStrong@Password123;TrustServerCertificate=True
      - App__CorsOrigins=http://localhost:3000,http://72.60.234.126,http://72.60.234.126:3000
      - App__SelfUrl=http://72.60.234.126:8080
      - AuthServer__Authority=http://72.60.234.126:8080
      - AuthServer__RequireHttpsMetadata=false
    depends_on:
      sqlserver:
        condition: service_healthy
    networks:
      - app-network

  # Frontend
  frontend:
    image: ghcr.io/aramadan19912/combined-home-services-backend/frontend:latest
    container_name: homeservices_frontend_1
    ports:
      - "3000:8080"
    environment:
      - VITE_API_BASE_URL=http://72.60.234.126:8080/api
      - VITE_API_HOST_URL=http://72.60.234.126:8080/api
      - VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api
    networks:
      - app-network
    depends_on:
      - api

volumes:
  sqlserver-data:

networks:
  app-network:
    driver: bridge
EOF
    echo "✅ Created docker-compose.yml"
    
    # Try to pull and start containers
    echo "Pulling images..."
    docker-compose pull
    echo "Starting containers..."
    docker-compose up -d
fi
echo ""

# Step 4: Wait for containers to start
echo "⏳ Step 4: Waiting for containers to start (30 seconds)..."
sleep 30
echo ""

# Step 5: Check container status again
echo "📊 Step 5: Checking container status after startup..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Step 6: Check container logs
echo "📋 Step 6: Checking container logs..."
echo "Frontend logs:"
docker logs homeservices_frontend_1 --tail 20 2>&1 || echo "Frontend container not found"
echo ""
echo "API logs:"
docker logs homeservices_api_1 --tail 20 2>&1 || echo "API container not found"
echo ""

# Step 7: Test endpoints again
echo "🧪 Step 7: Testing endpoints..."
sleep 5
echo "Testing local endpoints:"
curl -s -o /dev/null -w "Frontend (port 3000):      HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "API (port 8080):           HTTP %{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "Frontend (port 80):        HTTP %{http_code}\n" http://localhost/
curl -s -o /dev/null -w "API (port 80/api):         HTTP %{http_code}\n" http://localhost/api/
curl -s -o /dev/null -w "Swagger (port 80/swagger): HTTP %{http_code}\n" http://localhost/swagger/
echo ""

# Step 8: Restart nginx just in case
echo "🔄 Step 8: Restarting nginx..."
systemctl restart nginx
echo "✅ Nginx restarted"
echo ""

# Step 9: Final test
echo "🧪 Step 9: Final endpoint test..."
sleep 3
curl -I http://localhost/ 2>&1 | head -5
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend deployment fix attempt completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If frontend is still not working, check:"
echo "1. Docker images are pulled: docker images"
echo "2. Network connectivity: docker network ls"
echo "3. Container details: docker inspect homeservices_frontend_1"
echo "4. Full logs: docker logs homeservices_frontend_1"
echo ""