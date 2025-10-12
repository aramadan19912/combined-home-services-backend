#!/bin/bash

###############################################################################
# Rollback Script for Hostinger Deployment
# 
# Usage: ./scripts/rollback.sh [backup-timestamp]
# 
# If no timestamp provided, rolls back to the most recent backup
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Rollback Deployment - Home Services Platform  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Load configuration
if [ ! -f .env.deploy ]; then
    echo -e "${RED}Error: .env.deploy not found${NC}"
    echo "Please run deploy-to-hostinger.sh first to create configuration"
    exit 1
fi

source .env.deploy

BACKUP_TIMESTAMP=$1

echo -e "${YELLOW}Connecting to VPS to list available backups...${NC}"
echo ""

# List available backups
ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" << 'ENDSSH'
    echo "Available Backend Backups:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ls -lht /var/www/homeservices/backend/publish.backup.* 2>/dev/null | head -5 || echo "No backups found"
    
    echo ""
    echo "Available Frontend Backups:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ls -lht /var/www/homeservices/frontend/dist.backup.* 2>/dev/null | head -5 || echo "No backups found"
ENDSSH

echo ""

if [ -z "$BACKUP_TIMESTAMP" ]; then
    echo -e "${YELLOW}No backup timestamp specified${NC}"
    echo "Rolling back to most recent backup..."
    echo ""
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Rollback cancelled"
        exit 0
    fi
else
    echo -e "${YELLOW}Rolling back to backup: $BACKUP_TIMESTAMP${NC}"
    echo ""
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Rollback cancelled"
        exit 0
    fi
fi

# Perform rollback
echo ""
echo -e "${YELLOW}Performing rollback...${NC}"

ssh -i "$VPS_SSH_KEY" "$VPS_USER@$VPS_HOST" << ENDSSH
    set -e
    
    BACKUP_TS="$BACKUP_TIMESTAMP"
    
    echo "Stopping backend service..."
    sudo systemctl stop homeservices-api
    
    # Rollback backend
    if [ -z "\$BACKUP_TS" ]; then
        LATEST_BACKEND_BACKUP=\$(ls -t /var/www/homeservices/backend/publish.backup.* 2>/dev/null | head -n 1)
    else
        LATEST_BACKEND_BACKUP="/var/www/homeservices/backend/publish.backup.\$BACKUP_TS"
    fi
    
    if [ -n "\$LATEST_BACKEND_BACKUP" ] && [ -d "\$LATEST_BACKEND_BACKUP" ]; then
        echo "Restoring backend from: \$LATEST_BACKEND_BACKUP"
        sudo rm -rf /var/www/homeservices/backend/publish
        sudo cp -r "\$LATEST_BACKEND_BACKUP" /var/www/homeservices/backend/publish
        sudo chown -R www-data:www-data /var/www/homeservices/backend/publish
        echo "✓ Backend restored"
    else
        echo "⚠ No backend backup found"
    fi
    
    # Rollback frontend
    if [ -z "\$BACKUP_TS" ]; then
        LATEST_FRONTEND_BACKUP=\$(ls -t /var/www/homeservices/frontend/dist.backup.* 2>/dev/null | head -n 1)
    else
        LATEST_FRONTEND_BACKUP="/var/www/homeservices/frontend/dist.backup.\$BACKUP_TS"
    fi
    
    if [ -n "\$LATEST_FRONTEND_BACKUP" ] && [ -d "\$LATEST_FRONTEND_BACKUP" ]; then
        echo "Restoring frontend from: \$LATEST_FRONTEND_BACKUP"
        sudo rm -rf /var/www/homeservices/frontend/dist
        sudo cp -r "\$LATEST_FRONTEND_BACKUP" /var/www/homeservices/frontend/dist
        sudo chown -R www-data:www-data /var/www/homeservices/frontend/dist
        echo "✓ Frontend restored"
    else
        echo "⚠ No frontend backup found"
    fi
    
    echo ""
    echo "Restarting services..."
    sudo systemctl start homeservices-api
    sudo systemctl reload nginx
    
    echo ""
    echo "Checking service status..."
    sleep 2
    sudo systemctl status homeservices-api --no-pager || true
ENDSSH

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ROLLBACK COMPLETED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Verify the application:${NC}"
echo "🌐 https://$DOMAIN_NAME"
echo ""
