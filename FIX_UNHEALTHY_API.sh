#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING UNHEALTHY API CONTAINER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices || exit 1

# Step 1: Check current status
echo "📊 Step 1: Current container status..."
docker ps -a
echo ""

# Step 2: Check API logs to see what's failing
echo "📝 Step 2: API container logs..."
docker logs homeservices_api_1 --tail 100 2>&1 || echo "Container doesn't exist yet"
echo ""

# Step 3: Stop everything
echo "🛑 Step 3: Stopping all containers..."
docker-compose down
docker rm -f $(docker ps -aq) 2>/dev/null || true
echo "✅ Stopped"
echo ""

# Step 4: Clean .env file (remove those warnings)
echo "🧹 Step 4: Cleaning .env file..."
if [ -f .env ]; then
    # Remove comment lines and empty lines that cause warnings
    sed -i '/^#/d' .env
    sed -i '/^$/d' .env
    echo "✅ .env cleaned"
else
    echo "No .env file found, skipping"
fi
echo ""

# Step 5: Update docker-compose to remove health checks temporarily
echo "📝 Step 5: Creating simplified docker-compose..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
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
    restart: unless-stopped

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: homeservices_api_1
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
      - Database__Provider=SqlServer
      - ConnectionStrings__Default=Server=sqlserver;Database=HomeServices;User Id=SA;Password=YourStrong@Password123;TrustServerCertificate=True;Encrypt=True
      - App__CorsOrigins=http://72.60.234.126
      - App__SelfUrl=http://72.60.234.126:8080
    ports:
      - "8080:8080"
    networks:
      - app-network
    restart: unless-stopped
    depends_on:
      - sqlserver

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=http://72.60.234.126/api
        - VITE_API_HOST_URL=http://72.60.234.126/api
    container_name: homeservices_frontend_1
    ports:
      - "3000:8080"
    depends_on:
      - api
    networks:
      - app-network
    restart: unless-stopped

volumes:
  sqlserver-data:

networks:
  app-network:
    driver: bridge
EOF
echo "✅ docker-compose.yml updated (removed health checks)"
echo ""

# Step 6: Start SQL Server first and wait
echo "🗄️ Step 6: Starting SQL Server..."
docker-compose up -d sqlserver
echo "Waiting 40 seconds for SQL Server to fully initialize..."
sleep 40
echo ""

# Step 7: Verify SQL Server is ready
echo "🔍 Step 7: Verifying SQL Server..."
for i in {1..5}; do
    docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "SELECT @@VERSION" && break
    echo "Attempt $i failed, waiting 10 more seconds..."
    sleep 10
done
echo "✅ SQL Server is ready"
echo ""

# Step 8: Create database
echo "📊 Step 8: Creating database..."
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HomeServices')
BEGIN
    CREATE DATABASE HomeServices;
END
ELSE
BEGIN
    ALTER DATABASE HomeServices SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HomeServices;
    CREATE DATABASE HomeServices;
END
"
echo "✅ Database ready"
echo ""

# Step 9: Build API (fresh build)
echo "🔨 Step 9: Building API container (this may take 2-3 minutes)..."
docker-compose build --no-cache api
echo "✅ API built"
echo ""

# Step 10: Start API
echo "🚀 Step 10: Starting API..."
docker-compose up -d api
echo "Waiting 60 seconds for API to start and create schema..."
sleep 60
echo ""

# Step 11: Check API status
echo "📊 Step 11: Checking API status..."
docker ps | grep api
echo ""

# Step 12: Check API logs
echo "📝 Step 12: Recent API logs..."
docker logs homeservices_api_1 --tail 50
echo ""

# Step 13: Test API
echo "🧪 Step 13: Testing API endpoint..."
curl -s -o /dev/null -w "API Status: HTTP %{http_code}\n" http://localhost:8080/ || echo "API not responding yet"
echo ""

# Step 14: Start frontend
echo "🎨 Step 14: Starting frontend..."
docker-compose up -d frontend
sleep 15
echo ""

# Step 15: Final status
echo "📦 Step 15: Final container status..."
docker ps
echo ""

# Step 16: Check database tables
echo "🗃️ Step 16: Checking database tables..."
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -d HomeServices -Q "SELECT COUNT(*) as TableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';" 2>&1 || echo "Could not query tables"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Check if API container is running:"
echo "   docker ps | grep api"
echo ""
echo "📝 If still unhealthy, check full logs:"
echo "   docker logs homeservices_api_1"
echo ""
echo "🌐 If running, continue with Nginx setup:"
echo "   bash SETUP_NGINX_PROXY.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
