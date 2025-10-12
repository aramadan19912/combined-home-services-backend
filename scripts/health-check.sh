#!/bin/bash

###############################################################################
# Health Check Script
# 
# Usage: ./scripts/health-check.sh
# 
# Performs comprehensive health checks on your deployed application
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Health Check - Home Services Platform  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Load configuration
if [ ! -f .env.deploy ]; then
    echo -e "${RED}Error: .env.deploy not found${NC}"
    echo "Creating default configuration..."
    cat > .env.deploy << 'EOF'
VPS_HOST="your-vps-ip"
VPS_USER="deployer"
VPS_SSH_KEY="~/.ssh/hostinger_deploy"
DOMAIN_NAME="your-domain.com"
EOF
    echo "Please configure .env.deploy and run again"
    exit 1
fi

source .env.deploy

FAILED=0
PASSED=0

check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ $2${NC}"
        ((FAILED++))
    fi
}

echo ""
echo -e "${YELLOW}1. Checking Frontend...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check HTTPS
curl -f -s -o /dev/null "https://$DOMAIN_NAME" 2>/dev/null
check_result $? "Frontend accessible via HTTPS"

# Check HTTP redirect
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN_NAME" 2>/dev/null)
if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    check_result 0 "HTTP to HTTPS redirect"
else
    check_result 1 "HTTP to HTTPS redirect (Got: $HTTP_CODE)"
fi

# Check if index.html loads
curl -f -s "https://$DOMAIN_NAME" | grep -q "<!DOCTYPE html>" 2>/dev/null
check_result $? "Frontend HTML loads correctly"

echo ""
echo -e "${YELLOW}2. Checking Backend API...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check API base endpoint
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN_NAME/api" 2>/dev/null)
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
    check_result 0 "API endpoint accessible (Status: $API_STATUS)"
else
    check_result 1 "API endpoint accessible (Status: $API_STATUS)"
fi

# Check health endpoint if exists
curl -f -s -o /dev/null "https://$DOMAIN_NAME/api/health" 2>/dev/null
if [ $? -eq 0 ]; then
    check_result 0 "API health endpoint responding"
else
    echo -e "${YELLOW}  ℹ Health endpoint not configured (optional)${NC}"
fi

# Check Swagger/OpenAPI if available
curl -f -s -o /dev/null "https://$DOMAIN_NAME/api/swagger" 2>/dev/null
if [ $? -eq 0 ]; then
    check_result 0 "Swagger documentation accessible"
else
    echo -e "${YELLOW}  ℹ Swagger not accessible (might be disabled in production)${NC}"
fi

echo ""
echo -e "${YELLOW}3. Checking SSL Certificate...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check SSL validity
SSL_INFO=$(echo | openssl s_client -connect "$DOMAIN_NAME:443" -servername "$DOMAIN_NAME" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    check_result 0 "SSL certificate valid"
    echo "$SSL_INFO" | sed 's/^/  /'
else
    check_result 1 "SSL certificate check"
fi

echo ""
echo -e "${YELLOW}4. Checking Server Resources (via SSH)...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$VPS_HOST" != "your-vps-ip" ]; then
    ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH' 2>/dev/null
        echo "Backend Service Status:"
        sudo systemctl is-active homeservices-api --quiet && echo "  ✓ Running" || echo "  ✗ Not Running"
        
        echo ""
        echo "Nginx Status:"
        sudo systemctl is-active nginx --quiet && echo "  ✓ Running" || echo "  ✗ Not Running"
        
        echo ""
        echo "PostgreSQL Status:"
        sudo systemctl is-active postgresql --quiet && echo "  ✓ Running" || echo "  ✗ Not Running"
        
        echo ""
        echo "Disk Usage:"
        df -h / | tail -1 | awk '{print "  " $5 " used (" $3 " / " $2 ")"}'
        
        echo ""
        echo "Memory Usage:"
        free -h | grep Mem | awk '{print "  " $3 " / " $2 " (" int($3/$2*100) "%)"}'
        
        echo ""
        echo "Backend Process:"
        if pgrep -f "HomeServicesApp.HttpApi.Host.dll" > /dev/null; then
            echo "  ✓ Backend process running"
            ps aux | grep "HomeServicesApp.HttpApi.Host.dll" | grep -v grep | awk '{print "  CPU: " $3 "%, MEM: " $4 "%"}'
        else
            echo "  ✗ Backend process not found"
        fi
ENDSSH
else
    echo -e "${YELLOW}  ℹ SSH not configured. Set VPS_HOST in .env.deploy${NC}"
fi

echo ""
echo -e "${YELLOW}5. Checking Response Times...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend response time
FRONTEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' "https://$DOMAIN_NAME")
echo "  Frontend: ${FRONTEND_TIME}s"
if (( $(echo "$FRONTEND_TIME < 2.0" | bc -l) )); then
    ((PASSED++))
else
    echo -e "${YELLOW}  ⚠ Frontend response time slow${NC}"
fi

# API response time
API_TIME=$(curl -o /dev/null -s -w '%{time_total}' "https://$DOMAIN_NAME/api")
echo "  API: ${API_TIME}s"
if (( $(echo "$API_TIME < 2.0" | bc -l) )); then
    ((PASSED++))
else
    echo -e "${YELLOW}  ⚠ API response time slow${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}HEALTH CHECK SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Your application is healthy.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some checks failed. Please review the results above.${NC}"
    exit 1
fi
