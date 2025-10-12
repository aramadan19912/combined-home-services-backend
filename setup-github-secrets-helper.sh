#!/bin/bash

# GitHub Secrets Setup Helper Script
# This script helps you gather all the information needed for GitHub Secrets

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GitHub Secrets Setup Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will help you gather the values for GitHub Secrets"
echo ""

# Check if SSH key exists
if [ -f ~/.ssh/hostinger_deploy ]; then
    echo "✓ SSH key found at ~/.ssh/hostinger_deploy"
else
    echo "✗ SSH key not found"
    echo "  Run: ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/hostinger_deploy"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Copy these values to GitHub Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get configuration interactively
read -p "Enter your VPS IP address: " VPS_HOST
read -p "Enter your VPS username [deployer]: " VPS_USER
VPS_USER=${VPS_USER:-deployer}
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
read -p "Enter database name [homeservices]: " DB_NAME
DB_NAME=${DB_NAME:-homeservices}
read -p "Enter database user [homeservices_user]: " DB_USER
DB_USER=${DB_USER:-homeservices_user}
read -sp "Enter database password: " DB_PASSWORD
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GitHub Secrets Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣  SSH_PRIVATE_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Copy the output below (including BEGIN/END lines):"
echo ""
cat ~/.ssh/hostinger_deploy
echo ""
echo ""

echo "2️⃣  VPS_HOST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$VPS_HOST"
echo ""

echo "3️⃣  VPS_USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$VPS_USER"
echo ""

echo "4️⃣  DOMAIN_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DOMAIN_NAME"
echo ""

echo "5️⃣  DB_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DB_NAME"
echo ""

echo "6️⃣  DB_USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DB_USER"
echo ""

echo "7️⃣  DB_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$DB_PASSWORD"
echo ""

echo "8️⃣  VITE_API_BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "https://$DOMAIN_NAME/api"
echo ""

echo "9️⃣  VITE_AUTH_API_BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "https://$DOMAIN_NAME/api"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret with the values above"
echo "4. Make sure secret names match EXACTLY (case-sensitive)"
echo ""
echo "Public key to add to VPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ~/.ssh/hostinger_deploy.pub
echo ""
echo "Add this to your VPS with:"
echo "ssh $VPS_USER@$VPS_HOST"
echo "echo \"$(cat ~/.ssh/hostinger_deploy.pub)\" >> ~/.ssh/authorized_keys"
echo ""
