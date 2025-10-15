#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SHOWING ALL ERRORS FOR 500 ERROR DIAGNOSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣ All running containers:"
docker ps -a
echo ""

echo "2️⃣ Is frontend container actually running?"
if docker ps | grep -q "homeservices_frontend"; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container is NOT running!"
fi
echo ""

echo "3️⃣ Frontend container logs (FULL):"
docker logs homeservices_frontend_1 2>&1 || echo "Container doesn't exist"
echo ""

echo "4️⃣ Nginx access log (last 20 lines):"
tail -20 /var/log/nginx/access.log
echo ""

echo "5️⃣ Nginx error log (last 30 lines):"
tail -30 /var/log/nginx/error.log
echo ""

echo "6️⃣ Testing frontend container directly:"
docker exec homeservices_frontend_1 ls -la /usr/share/nginx/html 2>&1 || echo "Cannot exec into container"
echo ""

echo "7️⃣ Nginx configuration:"
cat /etc/nginx/sites-available/homeservices
echo ""

echo "8️⃣ Testing from inside the server:"
echo "Testing localhost:3000..."
curl -v http://localhost:3000/ 2>&1 | head -30
echo ""
echo "Testing localhost:80..."
curl -v http://localhost/ 2>&1 | head -30
echo ""

echo "9️⃣ Network connectivity:"
docker network inspect homeservices_app-network | grep -A 5 frontend
echo ""

echo "🔟 Port bindings:"
netstat -tulpn | grep -E "(3000|80)" || ss -tulpn | grep -E "(3000|80)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 COPY ALL OUTPUT ABOVE AND SEND TO ME!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
