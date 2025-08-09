#!/bin/bash

# Deploy All Three Applications to Fly.io
# This script deploys Frontend, Backend API, and Auth Service

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment of HomeServices App to Fly.io${NC}"
echo "This will deploy three applications:"
echo "1. Frontend (homeservicesapp-frontend)"
echo "2. Backend API (homeservicesapp-api)"
echo "3. Auth Service (homeservicesapp-auth)"
echo ""

# Check if fly CLI is available
if ! command -v fly &> /dev/null; then
    echo -e "${RED}❌ Fly CLI not found. Installing...${NC}"
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Check authentication
echo -e "${YELLOW}🔐 Checking Fly.io authentication...${NC}"
if ! fly auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with Fly.io. Please run 'fly auth login' first.${NC}"
    echo "After authentication, run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with Fly.io${NC}"
echo ""

# Function to deploy an application
deploy_app() {
    local app_name=$1
    local directory=$2
    local config_file=$3
    local description=$4
    
    echo -e "${BLUE}📦 Deploying $description ($app_name)...${NC}"
    cd "$directory"
    
    if [ -n "$config_file" ]; then
        fly deploy --config "$config_file"
    else
        fly deploy
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $description deployed successfully!${NC}"
        echo -e "${GREEN}🌐 URL: https://$app_name.fly.dev${NC}"
    else
        echo -e "${RED}❌ Failed to deploy $description${NC}"
        exit 1
    fi
    echo ""
}

# Deploy Frontend
deploy_app "homeservicesapp-frontend" "/workspace/frontend" "" "Frontend Application"

# Deploy Backend API
deploy_app "homeservicesapp-api" "/workspace/backend" "" "Backend API"

# Deploy Auth Service
deploy_app "homeservicesapp-auth" "/workspace/backend" "fly-auth.toml" "Auth Service"

echo -e "${GREEN}🎉 All applications deployed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Application URLs:${NC}"
echo "Frontend:    https://homeservicesapp-frontend.fly.dev"
echo "Backend API: https://homeservicesapp-api.fly.dev"
echo "Auth Service: https://homeservicesapp-auth.fly.dev"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Update environment variables if needed"
echo "2. Verify health checks are passing"
echo "3. Test the applications"
echo ""
echo -e "${BLUE}📖 For more details, see: FLY_DEPLOYMENT_GUIDE.md${NC}"