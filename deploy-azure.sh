#!/usr/bin/env bash
set -euo pipefail

# Azure Deployment Script for Home Services App
# This script handles the complete deployment to Azure

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
print_success() { echo -e "${GREEN}✅ ${NC}$1"; }
print_warning() { echo -e "${YELLOW}⚠️  ${NC}$1"; }
print_error() { echo -e "${RED}❌ ${NC}$1"; }

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

print_info "Home Services App - Azure Deployment"
echo ""

# Step 1: Check Azure login status
print_info "Checking Azure login status..."
if ! az account show &> /dev/null; then
    print_warning "Not logged in to Azure. Running 'az login'..."
    az login
else
    print_success "Already logged in to Azure"
    ACCOUNT_NAME=$(az account show --query name -o tsv)
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    echo "  Account: $ACCOUNT_NAME"
    echo "  Subscription: $SUBSCRIPTION_ID"
fi

echo ""

# Step 2: Provision infrastructure
print_info "Provisioning Azure infrastructure..."
read -p "Do you want to provision new resources? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter resource group name (default: hsapp-rg): " RESOURCE_GROUP
    RESOURCE_GROUP=${RESOURCE_GROUP:-hsapp-rg}
    
    read -p "Enter Azure region (default: eastus): " LOCATION
    LOCATION=${LOCATION:-eastus}
    
    export RESOURCE_GROUP
    export LOCATION
    
    chmod +x "$SCRIPT_DIR/infra/azure/provision.sh"
    "$SCRIPT_DIR/infra/azure/provision.sh"
    
    print_success "Infrastructure provisioned successfully"
else
    print_info "Using existing infrastructure"
    read -p "Enter resource group name: " RESOURCE_GROUP
    
    # Fetch existing resource details
    ACR_NAME=$(az acr list -g "$RESOURCE_GROUP" --query "[0].name" -o tsv)
    ACR_LOGIN_SERVER=$(az acr show -n "$ACR_NAME" --query loginServer -o tsv)
    WEBAPP_API=$(az webapp list -g "$RESOURCE_GROUP" --query "[?contains(name, 'api')].name" -o tsv | head -1)
    WEBAPP_AUTH=$(az webapp list -g "$RESOURCE_GROUP" --query "[?contains(name, 'auth')].name" -o tsv | head -1)
    WEBAPP_FRONTEND=$(az webapp list -g "$RESOURCE_GROUP" --query "[?contains(name, 'frontend')].name" -o tsv | head -1)
fi

echo ""

# Step 3: Build and push Docker images
print_info "Building and pushing Docker images..."

# Login to ACR
print_info "Logging in to Azure Container Registry..."
az acr login -n "$ACR_NAME"

# Build and push API
print_info "Building API image..."
docker build \
    -f "$SCRIPT_DIR/backend/Dockerfile" \
    -t "$ACR_LOGIN_SERVER/hsapp-api:latest" \
    -t "$ACR_LOGIN_SERVER/hsapp-api:$(date +%Y%m%d-%H%M%S)" \
    "$SCRIPT_DIR/backend"
docker push "$ACR_LOGIN_SERVER/hsapp-api:latest"

# Build and push Auth Server
print_info "Building Auth Server image..."
docker build \
    -f "$SCRIPT_DIR/backend/AuthServer.Dockerfile" \
    -t "$ACR_LOGIN_SERVER/hsapp-auth:latest" \
    -t "$ACR_LOGIN_SERVER/hsapp-auth:$(date +%Y%m%d-%H%M%S)" \
    "$SCRIPT_DIR/backend"
docker push "$ACR_LOGIN_SERVER/hsapp-auth:latest"

# Build and push Frontend
print_info "Building Frontend image..."
docker build \
    -f "$SCRIPT_DIR/frontend/Dockerfile" \
    -t "$ACR_LOGIN_SERVER/hsapp-frontend:latest" \
    -t "$ACR_LOGIN_SERVER/hsapp-frontend:$(date +%Y%m%d-%H%M%S)" \
    "$SCRIPT_DIR/frontend"
docker push "$ACR_LOGIN_SERVER/hsapp-frontend:latest"

print_success "All images built and pushed successfully"
echo ""

# Step 4: Deploy to Web Apps
print_info "Deploying to Azure Web Apps..."

# Deploy API
print_info "Deploying API..."
az webapp config container set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_API" \
    --docker-custom-image-name "$ACR_LOGIN_SERVER/hsapp-api:latest" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER"

# Set API app settings
az webapp config appsettings set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_API" \
    --settings \
        WEBSITES_PORT=8080 \
        Database__Provider=Sqlite \
        ConnectionStrings__Default="Data Source=/data/app.db" \
        App__CorsOrigins="https://$WEBAPP_FRONTEND.azurewebsites.net" \
        App__SelfUrl="https://$WEBAPP_API.azurewebsites.net" \
        AuthServer__Authority="https://$WEBAPP_AUTH.azurewebsites.net" \
        AuthServer__RequireHttpsMetadata=true

# Deploy Auth Server
print_info "Deploying Auth Server..."
az webapp config container set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_AUTH" \
    --docker-custom-image-name "$ACR_LOGIN_SERVER/hsapp-auth:latest" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER"

# Set Auth app settings
az webapp config appsettings set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_AUTH" \
    --settings \
        WEBSITES_PORT=8081 \
        Database__Provider=Sqlite \
        ConnectionStrings__Default="Data Source=/data/auth.db" \
        App__CorsOrigins="https://$WEBAPP_FRONTEND.azurewebsites.net" \
        App__SelfUrl="https://$WEBAPP_AUTH.azurewebsites.net" \
        App__ClientUrl="https://$WEBAPP_FRONTEND.azurewebsites.net" \
        App__RedirectAllowedUrls="https://$WEBAPP_FRONTEND.azurewebsites.net"

# Deploy Frontend
print_info "Deploying Frontend..."
az webapp config container set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_FRONTEND" \
    --docker-custom-image-name "$ACR_LOGIN_SERVER/hsapp-frontend:latest" \
    --docker-registry-server-url "https://$ACR_LOGIN_SERVER"

# Set Frontend app settings
az webapp config appsettings set \
    -g "$RESOURCE_GROUP" \
    -n "$WEBAPP_FRONTEND" \
    --settings \
        WEBSITES_PORT=8080 \
        VITE_API_BASE_URL="https://$WEBAPP_AUTH.azurewebsites.net" \
        VITE_API_HOST_URL="https://$WEBAPP_API.azurewebsites.net/api/v1" \
        VITE_ENVIRONMENT=production

print_success "All services deployed successfully"
echo ""

# Step 5: Restart services
print_info "Restarting services to apply changes..."
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_API" &
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_AUTH" &
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_FRONTEND" &
wait

print_success "All services restarted"
echo ""

# Final summary
print_success "🚀 Deployment Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Application URLs:"
echo "   Frontend:    https://$WEBAPP_FRONTEND.azurewebsites.net"
echo "   API:         https://$WEBAPP_API.azurewebsites.net"
echo "   Auth Server: https://$WEBAPP_AUTH.azurewebsites.net"
echo ""
echo "🔍 Monitor your deployment:"
echo "   az webapp log tail -g $RESOURCE_GROUP -n $WEBAPP_FRONTEND"
echo "   az webapp log tail -g $RESOURCE_GROUP -n $WEBAPP_API"
echo "   az webapp log tail -g $RESOURCE_GROUP -n $WEBAPP_AUTH"
echo ""
echo "🌐 Open in browser:"
echo "   az webapp browse -g $RESOURCE_GROUP -n $WEBAPP_FRONTEND"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"