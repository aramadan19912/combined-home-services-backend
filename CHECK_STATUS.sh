#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING CURRENT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣ Docker containers:"
docker ps -a
echo ""

echo "2️⃣ Listening ports:"
netstat -tulpn | grep -E "(80|8080|3000|1433)" 2>/dev/null || ss -tulpn | grep -E "(80|8080|3000|1433)"
echo ""

echo "3️⃣ Nginx status:"
systemctl status nginx --no-pager | head -10 || echo "Nginx not installed"
echo ""

echo "4️⃣ API logs (last 20 lines):"
docker logs homeservices_api_1 --tail 20 2>&1 || echo "API container not running"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DIAGNOSIS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if containers are running
if docker ps | grep -q homeservices_api_1; then
    echo "✅ API container is running"
else
    echo "❌ API container is NOT running"
fi

if docker ps | grep -q homeservices_frontend_1; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container is NOT running"
fi

if docker ps | grep -q homeservices-sqlserver; then
    echo "✅ SQL Server container is running"
else
    echo "❌ SQL Server container is NOT running"
fi

# Check if Nginx is running
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running"
fi

# Check if port 80 is listening
if netstat -tulpn 2>/dev/null | grep -q ":80 " || ss -tulpn 2>/dev/null | grep -q ":80 "; then
    echo "✅ Port 80 is listening"
else
    echo "❌ Port 80 is NOT listening"
fi

# Check if port 8080 is listening
if netstat -tulpn 2>/dev/null | grep -q ":8080 " || ss -tulpn 2>/dev/null | grep -q ":8080 "; then
    echo "✅ Port 8080 is listening"
else
    echo "❌ Port 8080 is NOT listening"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 RECOMMENDED ACTION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! docker ps | grep -q homeservices_api_1; then
    echo ""
    echo "▶️ Containers are not running. Start them with:"
    echo "   cd /var/www/homeservices"
    echo "   docker-compose up -d"
    echo ""
fi

if ! systemctl is-active --quiet nginx 2>/dev/null; then
    echo ""
    echo "▶️ Nginx is not running. Set it up with:"
    echo "   bash SETUP_NGINX_PROXY.sh"
    echo ""
fi

if docker ps | grep -q "Restarting"; then
    echo ""
    echo "▶️ Some containers are restarting (crash loop). Check logs:"
    echo "   docker logs homeservices_api_1 --tail 100"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
