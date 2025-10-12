#!/bin/bash

###############################################################################
# Manual Deployment Script for Hostinger VPS
# 
# Usage: ./scripts/deploy-to-hostinger.sh
# 
# This script allows you to deploy manually without using CI/CD
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Home Services - Hostinger Manual Deployment  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Load configuration
if [ -f .env.deploy ]; then
    source .env.deploy
else
    echo -e "${YELLOW}Creating deployment configuration file...${NC}"
    cat > .env.deploy << 'EOF'
# Hostinger VPS Configuration
VPS_HOST="your-vps-ip"
VPS_USER="deployer"
VPS_SSH_KEY="~/.ssh/hostinger_deploy"
DOMAIN_NAME="your-domain.com"
APP_DIR="/var/www/homeservices"

# API Configuration
VITE_API_BASE_URL="https://your-domain.com/api"
VITE_AUTH_API_BASE_URL="https://your-domain.com/api"
EOF
    
    echo -e "${RED}Please edit .env.deploy with your VPS details and run again${NC}"
    exit 1
fi

# Verify configuration
if [ "$VPS_HOST" == "your-vps-ip" ]; then
    echo -e "${RED}Error: Please configure .env.deploy with your VPS details${NC}"
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ! ssh -i "$VPS_SSH_KEY" -o ConnectTimeout=10 "$VPS_USER@$VPS_HOST" "echo 'Connected successfully'" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to VPS${NC}"
    echo "Please check:"
    echo "  1. VPS_HOST is correct"
    echo "  2. VPS_USER is correct"
    echo "  3. SSH key is correct and has proper permissions"
    echo "  4. VPS is running and accessible"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"

# Ask for confirmation
echo ""
echo -e "${YELLOW}Deployment Configuration:${NC}"
echo "  VPS Host: $VPS_HOST"
echo "  VPS User: $VPS_USER"
echo "  Domain: $DOMAIN_NAME"
echo "  App Directory: $APP_DIR"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Create deployment directory
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Building Frontend${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_BASE_URL=$VITE_API_BASE_URL
VITE_AUTH_API_BASE_URL=$VITE_AUTH_API_BASE_URL
EOF

echo "Installing dependencies..."
npm ci

echo "Building frontend..."
npm run build

echo -e "${GREEN}✓ Frontend build completed${NC}"

# Build backend
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Building Backend${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd ../backend

echo "Building backend..."
dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj \
    -c Release \
    -o ./publish

echo -e "${GREEN}✓ Backend build completed${NC}"

# Create deployment archives
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Creating Deployment Packages${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd ..

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "Temp directory: $TEMP_DIR"

# Package frontend
echo "Packaging frontend..."
cd frontend/dist
tar -czf "$TEMP_DIR/frontend.tar.gz" .
cd ../..

# Package backend
echo "Packaging backend..."
cd backend/publish
tar -czf "$TEMP_DIR/backend.tar.gz" .
cd ../..

echo -e "${GREEN}✓ Packages created${NC}"

# Upload to VPS
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Uploading to VPS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Uploading frontend..."
scp -i "$VPS_SSH_KEY" "$TEMP_DIR/frontend.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/"

echo "Uploading backend..."
scp -i "$VPS_SSH_KEY" "$TEMP_DIR/backend.tar.gz" "$VPS_USER@$VPS_HOST:/tmp/"

echo -e "${GREEN}✓ Upload completed${NC}"

# Deploy on VPS
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Deploying on VPS${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" << ENDSSH
    set -e
    
    echo "Deploying backend..."
    
    # Stop service
    sudo systemctl stop homeservices-api
    
    # Backup current version
    BACKUP_TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
    if [ -d "$APP_DIR/backend/publish" ]; then
        sudo cp -r "$APP_DIR/backend/publish" "$APP_DIR/backend/publish.backup.\$BACKUP_TIMESTAMP"
        echo "Backup created: publish.backup.\$BACKUP_TIMESTAMP"
    fi
    
    # Extract new version
    sudo rm -rf "$APP_DIR/backend/publish"
    sudo mkdir -p "$APP_DIR/backend/publish"
    sudo tar -xzf /tmp/backend.tar.gz -C "$APP_DIR/backend/publish/"
    
    # Set permissions
    sudo chown -R www-data:www-data "$APP_DIR/backend/publish"
    
    # Start service
    sudo systemctl start homeservices-api
    
    # Check status
    sleep 2
    sudo systemctl status homeservices-api --no-pager || true
    
    echo ""
    echo "Deploying frontend..."
    
    # Backup frontend
    if [ -d "$APP_DIR/frontend/dist" ]; then
        sudo cp -r "$APP_DIR/frontend/dist" "$APP_DIR/frontend/dist.backup.\$BACKUP_TIMESTAMP"
        echo "Backup created: dist.backup.\$BACKUP_TIMESTAMP"
    fi
    
    # Extract new version
    sudo rm -rf "$APP_DIR/frontend/dist"
    sudo mkdir -p "$APP_DIR/frontend/dist"
    sudo tar -xzf /tmp/frontend.tar.gz -C "$APP_DIR/frontend/dist/"
    
    # Set permissions
    sudo chown -R www-data:www-data "$APP_DIR/frontend/dist"
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    # Clean up
    rm /tmp/frontend.tar.gz
    rm /tmp/backend.tar.gz
    
    # Clean old backups (keep last 3)
    cd "$APP_DIR/backend"
    ls -t publish.backup.* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf || true
    
    cd "$APP_DIR/frontend"
    ls -t dist.backup.* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf || true
    
    echo ""
    echo "Deployment completed!"
ENDSSH

# Clean up local temp files
echo ""
echo -e "${YELLOW}Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"

# Health check
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 6: Health Check${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Waiting for services to start..."
sleep 5

# Check API
if curl -f -k "https://$DOMAIN_NAME/api/health" > /dev/null 2>&1 || \
   curl -f "http://$VPS_HOST:5000/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${YELLOW}⚠ API health check endpoint not available (might be normal)${NC}"
fi

# Check frontend
if curl -f "https://$DOMAIN_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend check failed${NC}"
fi

# Deployment summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Your application is now live at:${NC}"
echo -e "${GREEN}🌐 https://$DOMAIN_NAME${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View API logs:    ssh -i $VPS_SSH_KEY $VPS_USER@$VPS_HOST 'sudo journalctl -u homeservices-api -f'"
echo "  Restart API:      ssh -i $VPS_SSH_KEY $VPS_USER@$VPS_HOST 'sudo systemctl restart homeservices-api'"
echo "  View Nginx logs:  ssh -i $VPS_SSH_KEY $VPS_USER@$VPS_HOST 'sudo tail -f /var/log/nginx/access.log'"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
