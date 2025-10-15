#!/bin/bash
echo "=================================="
echo "QUICK DIAGNOSTIC - Copy ALL output"
echo "=================================="
echo ""
echo "1. Current Directory:"
pwd
echo ""
echo "2. Docker Status:"
docker --version 2>&1
docker-compose --version 2>&1
echo ""
echo "3. Running Containers:"
docker ps -a
echo ""
echo "4. Backend Container Logs (last 50 lines):"
docker logs homeservices_api_1 --tail 50 2>&1 || echo "Container not found"
echo ""
echo "5. Port Check:"
netstat -tulpn | grep -E "(8080|3000|1433)" 2>&1 || ss -tulpn | grep -E "(8080|3000|1433)"
echo ""
echo "6. Firewall Status:"
ufw status 2>&1
echo ""
echo "7. Docker Compose File:"
ls -la docker-compose.yml 2>&1
echo ""
echo "8. Test Local Connection:"
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8080/ 2>&1
curl -s -o /dev/null -w "Swagger: %{http_code}\n" http://localhost:8080/swagger 2>&1
echo ""
echo "=================================="
echo "END OF DIAGNOSTIC"
echo "=================================="
