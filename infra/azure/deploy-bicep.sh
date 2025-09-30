#!/usr/bin/env bash
set -euo pipefail

# Deploy Azure infrastructure using Bicep template

# Configuration
LOCATION="${LOCATION:-eastus}"
RESOURCE_GROUP="${RESOURCE_GROUP:-hsapp-rg}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
DATABASE_PROVIDER="${DATABASE_PROVIDER:-Sqlite}"
APP_SERVICE_SKU="${APP_SERVICE_SKU:-B1}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Deploying Home Services App to Azure using Bicep${NC}"
echo ""

# Check Azure login
if ! az account show &> /dev/null; then
    echo "Please login to Azure first: az login"
    exit 1
fi

# Create resource group
echo -e "${BLUE}Creating resource group: $RESOURCE_GROUP${NC}"
az group create -n "$RESOURCE_GROUP" -l "$LOCATION" -o none

# Deploy Bicep template
echo -e "${BLUE}Deploying infrastructure...${NC}"
DEPLOYMENT_OUTPUT=$(az deployment group create \
    -g "$RESOURCE_GROUP" \
    -f "$(dirname "$0")/main.bicep" \
    -p environment="$ENVIRONMENT" \
    -p databaseProvider="$DATABASE_PROVIDER" \
    -p appServiceSku="$APP_SERVICE_SKU" \
    --query properties.outputs \
    -o json)

# Extract outputs
ACR_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.acrName.value')
ACR_LOGIN_SERVER=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.acrLoginServer.value')
API_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.apiAppName.value')
AUTH_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.authAppName.value')
FRONTEND_APP_NAME=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.frontendAppName.value')
FRONTEND_URL=$(echo "$DEPLOYMENT_OUTPUT" | jq -r '.frontendAppUrl.value')

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Resource Group: $RESOURCE_GROUP"
echo "ACR Name: $ACR_NAME"
echo "ACR Login Server: $ACR_LOGIN_SERVER"
echo "API App: $API_APP_NAME"
echo "Auth App: $AUTH_APP_NAME"
echo "Frontend App: $FRONTEND_APP_NAME"
echo ""
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Save these values for CI/CD configuration."