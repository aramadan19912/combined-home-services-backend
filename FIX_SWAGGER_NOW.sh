#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING SWAGGER/API ACCESS - Hostinger VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if we're in the right directory
echo "📁 Step 1: Checking directory..."
if [ ! -d "/var/www/homeservices" ]; then
    echo "❌ Directory /var/www/homeservices doesn't exist!"
    echo "Creating it now..."
    mkdir -p /var/www/homeservices
    cd /var/www/homeservices
    echo "Cloning repository..."
    git clone https://github.com/aramadan19912/combined-home-services-backend.git .
else
    echo "✅ Directory exists"
    cd /var/www/homeservices
    echo "Pulling latest code..."
    git pull origin main
fi
echo ""

# Step 2: Check Docker
echo "🐳 Step 2: Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed! Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed! Installing..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi
echo "✅ Docker installed"
echo ""

# Step 3: Check running containers
echo "📦 Step 3: Current container status..."
docker ps -a
echo ""

# Step 4: Stop everything and start fresh
echo "🛑 Step 4: Stopping all containers..."
docker-compose down
docker stop $(docker ps -aq) 2>/dev/null || true
echo ""

# Step 5: Check if docker-compose.yml exists
echo "📄 Step 5: Checking docker-compose.yml..."
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found! Creating it..."
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
    healthcheck:
      test: /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q 'SELECT 1' || exit 1
      interval: 10s
      timeout: 3s
      retries: 10
      start_period: 30s

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: homeservices_api_1
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
      - Database__Provider=SqlServer
      - ConnectionStrings__Default=Server=sqlserver;Database=HomeServices;User Id=SA;Password=YourStrong@Password123;TrustServerCertificate=True
      - App__CorsOrigins=http://72.60.234.126
      - App__SelfUrl=http://72.60.234.126:8080
    ports:
      - "8080:8080"
    depends_on:
      sqlserver:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=http://72.60.234.126:8080/api
        - VITE_API_HOST_URL=http://72.60.234.126:8080/api
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
fi
echo "✅ docker-compose.yml ready"
echo ""

# Step 6: Open firewall ports
echo "🔥 Step 6: Opening firewall ports..."
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw allow 1433/tcp
echo "✅ Ports opened"
echo ""

# Step 7: Start SQL Server first
echo "🗄️ Step 7: Starting SQL Server..."
docker-compose up -d sqlserver
echo "Waiting for SQL Server to be ready (30 seconds)..."
sleep 30
echo ""

# Step 8: Create database
echo "📊 Step 8: Creating database..."
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HomeServices')
BEGIN
    CREATE DATABASE HomeServices;
END
" 2>/dev/null || echo "Database might already exist"
echo ""

# Step 9: Build and start all services
echo "🚀 Step 9: Building and starting all services..."
docker-compose up -d --build
echo ""

# Step 10: Wait for services
echo "⏳ Step 10: Waiting for services to start (60 seconds)..."
sleep 60
echo ""

# Step 11: Check status
echo "📊 Step 11: Current status..."
docker ps
echo ""

# Step 12: Check backend logs
echo "📝 Step 12: Backend logs (last 30 lines)..."
docker logs homeservices_api_1 --tail 30
echo ""

# Step 13: Test endpoints
echo "🧪 Step 13: Testing endpoints..."
echo ""
echo "Testing backend..."
curl -s -o /dev/null -w "Backend (port 8080): HTTP %{http_code}\n" http://localhost:8080/ || echo "❌ Backend not responding"
echo ""
echo "Testing Swagger..."
curl -s -o /dev/null -w "Swagger: HTTP %{http_code}\n" http://localhost:8080/swagger/index.html || echo "❌ Swagger not responding"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your app:"
echo "   Swagger:  http://72.60.234.126:8080/swagger"
echo "   API:      http://72.60.234.126:8080/api"
echo "   Frontend: http://72.60.234.126:3000"
echo ""
echo "🔍 If still not working, check logs:"
echo "   docker logs homeservices_api_1 --tail 100"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
