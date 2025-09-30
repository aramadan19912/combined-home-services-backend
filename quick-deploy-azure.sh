#!/usr/bin/env bash
set -euo pipefail

# Quick Deploy to Azure - One-command deployment script
# Usage: ./quick-deploy-azure.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
clear
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║          🏠 Home Services App - Azure Deploy 🚀          ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check prerequisites
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"
MISSING_PREREQS=0

if ! command -v az &> /dev/null; then
    echo -e "${RED}✗ Azure CLI not installed${NC}"
    MISSING_PREREQS=1
else
    echo -e "${GREEN}✓ Azure CLI installed${NC}"
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not installed${NC}"
    MISSING_PREREQS=1
else
    echo -e "${GREEN}✓ Docker installed${NC}"
fi

if [ $MISSING_PREREQS -eq 1 ]; then
    echo ""
    echo -e "${RED}Please install missing prerequisites before continuing.${NC}"
    exit 1
fi

# Check Azure login
echo ""
echo -e "${BLUE}[2/6] Checking Azure login...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}Not logged in. Opening Azure login...${NC}"
    az login
else
    ACCOUNT=$(az account show --query name -o tsv)
    echo -e "${GREEN}✓ Logged in to: $ACCOUNT${NC}"
fi

# Get configuration
echo ""
echo -e "${BLUE}[3/6] Configuration${NC}"
echo ""
read -p "$(echo -e ${CYAN}Enter resource group name [hsapp-rg]: ${NC})" RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-hsapp-rg}

read -p "$(echo -e ${CYAN}Enter Azure region [eastus]: ${NC})" LOCATION
LOCATION=${LOCATION:-eastus}

read -p "$(echo -e ${CYAN}Enter environment [dev/prod]: ${NC})" ENV_TYPE
ENV_TYPE=${ENV_TYPE:-dev}

# Set defaults based on environment
if [ "$ENV_TYPE" = "prod" ]; then
    DEFAULT_SKU="P1v3"
    DEFAULT_DB="PostgreSql"
else
    DEFAULT_SKU="B1"
    DEFAULT_DB="Sqlite"
fi

read -p "$(echo -e ${CYAN}App Service SKU [$DEFAULT_SKU]: ${NC})" APP_SKU
APP_SKU=${APP_SKU:-$DEFAULT_SKU}

read -p "$(echo -e ${CYAN}Database provider [$DEFAULT_DB]: ${NC})" DB_PROVIDER
DB_PROVIDER=${DB_PROVIDER:-$DEFAULT_DB}

PG_CONN=""
if [ "$DB_PROVIDER" = "PostgreSql" ]; then
    echo ""
    echo -e "${YELLOW}PostgreSQL selected. You'll need to provide a connection string.${NC}"
    read -p "$(echo -e ${CYAN}PostgreSQL connection string: ${NC})" PG_CONN
fi

# Confirm
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Configuration Summary:${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Environment: $ENV_TYPE"
echo "  App Service SKU: $APP_SKU"
echo "  Database: $DB_PROVIDER"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "$(echo -e ${CYAN}Continue with deployment? [Y/n]: ${NC})" CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]?$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Provision infrastructure
echo ""
echo -e "${BLUE}[4/6] Provisioning Azure infrastructure...${NC}"
export RESOURCE_GROUP
export LOCATION

chmod +x "$SCRIPT_DIR/infra/azure/provision.sh"
PROVISION_OUTPUT=$("$SCRIPT_DIR/infra/azure/provision.sh")

# Extract values from provision output
ACR_NAME=$(echo "$PROVISION_OUTPUT" | grep "ACR_NAME=" | cut -d'=' -f2)
ACR_LOGIN_SERVER=$(echo "$PROVISION_OUTPUT" | grep "ACR_LOGIN_SERVER=" | cut -d'=' -f2)
WEBAPP_API=$(echo "$PROVISION_OUTPUT" | grep "WEBAPP_API=" | cut -d'=' -f2)
WEBAPP_AUTH=$(echo "$PROVISION_OUTPUT" | grep "WEBAPP_AUTH=" | cut -d'=' -f2)
WEBAPP_FRONTEND=$(echo "$PROVISION_OUTPUT" | grep "WEBAPP_FRONTEND=" | cut -d'=' -f2)

echo -e "${GREEN}✓ Infrastructure provisioned${NC}"

# Build and push images
echo ""
echo -e "${BLUE}[5/6] Building and pushing Docker images...${NC}"

echo -e "${CYAN}  → Logging in to ACR...${NC}"
az acr login -n "$ACR_NAME" > /dev/null 2>&1

echo -e "${CYAN}  → Building API image...${NC}"
docker build -f "$SCRIPT_DIR/backend/Dockerfile" \
    -t "$ACR_LOGIN_SERVER/hsapp-api:latest" \
    "$SCRIPT_DIR/backend" > /dev/null 2>&1
docker push "$ACR_LOGIN_SERVER/hsapp-api:latest" > /dev/null 2>&1
echo -e "${GREEN}    ✓ API image pushed${NC}"

echo -e "${CYAN}  → Building Auth Server image...${NC}"
docker build -f "$SCRIPT_DIR/backend/AuthServer.Dockerfile" \
    -t "$ACR_LOGIN_SERVER/hsapp-auth:latest" \
    "$SCRIPT_DIR/backend" > /dev/null 2>&1
docker push "$ACR_LOGIN_SERVER/hsapp-auth:latest" > /dev/null 2>&1
echo -e "${GREEN}    ✓ Auth Server image pushed${NC}"

echo -e "${CYAN}  → Building Frontend image...${NC}"
docker build -f "$SCRIPT_DIR/frontend/Dockerfile" \
    -t "$ACR_LOGIN_SERVER/hsapp-frontend:latest" \
    "$SCRIPT_DIR/frontend" > /dev/null 2>&1
docker push "$ACR_LOGIN_SERVER/hsapp-frontend:latest" > /dev/null 2>&1
echo -e "${GREEN}    ✓ Frontend image pushed${NC}"

# Deploy to Web Apps
echo ""
echo -e "${BLUE}[6/6] Deploying to Azure Web Apps...${NC}"

# Configure API
echo -e "${CYAN}  → Deploying API...${NC}"
az webapp config container set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_API" \
    --docker-custom-image-name "$ACR_LOGIN_SERVER/hsapp-api:latest" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER" > /dev/null 2>&1

CONN_STR="${PG_CONN:-Data Source=/data/app.db}"
az webapp config appsettings set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_API" \
    --settings \
        WEBSITES_PORT=8080 \
        Database__Provider="$DB_PROVIDER" \
        ConnectionStrings__Default="$CONN_STR" \
        App__CorsOrigins="https://$WEBAPP_FRONTEND.azurewebsites.net" \
        App__SelfUrl="https://$WEBAPP_API.azurewebsites.net" \
        AuthServer__Authority="https://$WEBAPP_AUTH.azurewebsites.net" \
        AuthServer__RequireHttpsMetadata=true > /dev/null 2>&1
echo -e "${GREEN}    ✓ API deployed${NC}"

# Configure Auth Server
echo -e "${CYAN}  → Deploying Auth Server...${NC}"
az webapp config container set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_AUTH" \
    --docker-custom-image-name "$ACR_LOGIN_SERVER/hsapp-auth:latest" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER" > /dev/null 2>&1

az webapp config appsettings set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_AUTH" \
    --settings \
        WEBSITES_PORT=8081 \
        Database__Provider="$DB_PROVIDER" \
        ConnectionStrings__Default="$CONN_STR" \
        App__CorsOrigins="https://$WEBAPP_FRONTEND.azurewebsites.net" \
        App__SelfUrl="https://$WEBAPP_AUTH.azurewebsites.net" \
        App__ClientUrl="https://$WEBAPP_FRONTEND.azurewebsites.net" \
        App__RedirectAllowedUrls="https://$WEBAPP_FRONTEND.azurewebsites.net" > /dev/null 2>&1
echo -e "${GREEN}    ✓ Auth Server deployed${NC}"

# Configure Frontend
echo -e "${CYAN}  → Deploying Frontend...${NC}"
az webapp config container set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_FRONTEND" \
    --docker-custom-image-name "$ACR_LOGIN_SERVER/hsapp-frontend:latest" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER" > /dev/null 2>&1

az webapp config appsettings set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_FRONTEND" \
    --settings \
        WEBSITES_PORT=8080 \
        VITE_API_BASE_URL="https://$WEBAPP_AUTH.azurewebsites.net" \
        VITE_API_HOST_URL="https://$WEBAPP_API.azurewebsites.net/api/v1" \
        VITE_ENVIRONMENT=production > /dev/null 2>&1
echo -e "${GREEN}    ✓ Frontend deployed${NC}"

# Restart services
echo ""
echo -e "${CYAN}  → Restarting services...${NC}"
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_API" > /dev/null 2>&1 &
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_AUTH" > /dev/null 2>&1 &
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_FRONTEND" > /dev/null 2>&1 &
wait

# Success
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ Deployment Successful! 🎉                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📍 Application URLs:${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Frontend:${NC}    https://$WEBAPP_FRONTEND.azurewebsites.net"
echo -e "  ${GREEN}API:${NC}         https://$WEBAPP_API.azurewebsites.net"
echo -e "  ${GREEN}Auth Server:${NC} https://$WEBAPP_AUTH.azurewebsites.net"
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 Useful Commands:${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  # View logs"
echo "  az webapp log tail -g $RESOURCE_GROUP -n $WEBAPP_FRONTEND"
echo ""
echo "  # Open in browser"
echo "  az webapp browse -g $RESOURCE_GROUP -n $WEBAPP_FRONTEND"
echo ""
echo "  # Redeploy"
echo "  ./deploy-azure.sh"
echo ""
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Opening frontend in browser...${NC}"
sleep 3
az webapp browse -g "$RESOURCE_GROUP" -n "$WEBAPP_FRONTEND" 2>/dev/null || true