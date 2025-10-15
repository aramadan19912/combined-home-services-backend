#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING ALL ISSUES - Hostinger VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices || exit 1

# Step 1: Open firewall ports
echo "🔥 Step 1: Opening firewall ports..."
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw allow 1433/tcp
echo "✅ Firewall configured"
echo ""

# Step 2: Stop all containers
echo "🛑 Step 2: Stopping all containers..."
docker-compose down
docker stop $(docker ps -aq) 2>/dev/null || true
echo "✅ Containers stopped"
echo ""

# Step 3: Pull latest code
echo "📥 Step 3: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 4: Start SQL Server
echo "🗄️ Step 4: Starting SQL Server..."
docker-compose up -d sqlserver
echo "Waiting 30 seconds for SQL Server to initialize..."
sleep 30
echo ""

# Step 5: Check SQL Server health
echo "🔍 Step 5: Checking SQL Server..."
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "SELECT @@VERSION" || {
    echo "❌ SQL Server not responding! Restarting..."
    docker-compose restart sqlserver
    sleep 30
}
echo "✅ SQL Server is running"
echo ""

# Step 6: Create/Reset Database
echo "📊 Step 6: Creating database..."
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'HomeServices')
BEGIN
    ALTER DATABASE HomeServices SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HomeServices;
END
CREATE DATABASE HomeServices;
"
echo "✅ Database created"
echo ""

# Step 7: Rebuild API container
echo "🔨 Step 7: Building API container..."
docker-compose build api
echo "✅ API built"
echo ""

# Step 8: Start API and let ABP create schema
echo "🚀 Step 8: Starting API (this will auto-create tables)..."
docker-compose up -d api
echo "Waiting 45 seconds for API to start and create schema..."
sleep 45
echo ""

# Step 9: Check API logs
echo "📝 Step 9: Checking API logs..."
docker logs homeservices_api_1 --tail 30
echo ""

# Step 10: Start frontend
echo "🎨 Step 10: Starting frontend..."
docker-compose up -d frontend
echo "Waiting 15 seconds..."
sleep 15
echo ""

# Step 11: Check all containers
echo "📦 Step 11: Container status..."
docker ps
echo ""

# Step 12: Check database tables
echo "🗃️ Step 12: Checking database tables..."
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -d HomeServices -Q "
SELECT TOP 5 name FROM sys.tables ORDER BY name;
" || echo "⚠️ Could not list tables - API might still be creating them"
echo ""

# Step 13: Test endpoints
echo "🧪 Step 13: Testing endpoints..."
sleep 10
curl -s -o /dev/null -w "Backend Root: HTTP %{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "Swagger: HTTP %{http_code}\n" http://localhost:8080/swagger/index.html
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000/
echo ""

# Step 14: Final status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application:"
echo "   Swagger:  http://72.60.234.126:8080/swagger"
echo "   API:      http://72.60.234.126:8080/api"
echo "   Frontend: http://72.60.234.126:3000"
echo ""
echo "🔍 If Swagger still doesn't work, check logs:"
echo "   docker logs homeservices_api_1 --tail 100"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
