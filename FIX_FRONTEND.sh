#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 DIAGNOSING FRONTEND 500 ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices || exit 1

echo "1️⃣ Frontend container status:"
docker ps -a | grep frontend
echo ""

echo "2️⃣ Frontend container logs (last 30 lines):"
docker logs homeservices_frontend_1 --tail 30 2>&1
echo ""

echo "3️⃣ Nginx error log (last 20 lines):"
tail -20 /var/log/nginx/error.log
echo ""

echo "4️⃣ Testing frontend container directly:"
curl -s -o /dev/null -w "Frontend container (port 3000): HTTP %{http_code}\n" http://localhost:3000/ || echo "Cannot reach frontend"
echo ""

echo "5️⃣ Testing through Nginx:"
curl -s -o /dev/null -w "Nginx proxy (port 80): HTTP %{http_code}\n" http://localhost/ || echo "Cannot reach through Nginx"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING FRONTEND..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if frontend is restarting
if docker ps -a | grep frontend | grep -q "Restarting"; then
    echo "⚠️ Frontend is in restart loop. Rebuilding..."
    docker-compose build --no-cache frontend
    docker-compose up -d frontend
    echo "Waiting 30 seconds..."
    sleep 30
fi

# Check if frontend is stopped
if docker ps -a | grep frontend | grep -q "Exited"; then
    echo "⚠️ Frontend is stopped. Starting..."
    docker-compose up -d frontend
    echo "Waiting 30 seconds..."
    sleep 30
fi

echo ""
echo "6️⃣ Final container status:"
docker ps | grep frontend
echo ""

echo "7️⃣ Testing again:"
curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Through Nginx: HTTP %{http_code}\n" http://localhost/
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NGINX CONFIGURATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /etc/nginx/sites-available/homeservices 2>/dev/null || echo "Nginx config not found"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DIAGNOSIS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If frontend is still not working, run:"
echo "   docker-compose build --no-cache frontend"
echo "   docker-compose up -d frontend"
echo ""
