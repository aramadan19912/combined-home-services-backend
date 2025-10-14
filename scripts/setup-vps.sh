#!/bin/bash

###############################################################################
# VPS Initial Setup Script for CI/CD
# 
# This script prepares your Hostinger VPS for automated deployments
# Run this ONCE on your VPS before setting up CI/CD
#
# Usage: 
#   1. Upload to VPS: scp scripts/setup-vps.sh root@your-vps-ip:/root/
#   2. Run on VPS: bash /root/setup-vps.sh
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VPS Setup for CI/CD - Home Services Platform  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root${NC}"
    exit 1
fi

# Get configuration
read -p "Enter domain name (e.g., example.com): " DOMAIN
read -p "Enter email for SSL certificate: " EMAIL
read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

APP_DIR="/var/www/homeservices"
DB_NAME="homeservices"
DB_USER="homeservices_user"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Create Deployment User${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create deployer user
if id "deployer" &>/dev/null; then
    echo "User 'deployer' already exists"
else
    adduser --disabled-password --gecos "" deployer
    echo -e "${GREEN}✓ User 'deployer' created${NC}"
fi

# Add to sudo group
usermod -aG sudo deployer

# Setup SSH directory
mkdir -p /home/deployer/.ssh
touch /home/deployer/.ssh/authorized_keys
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
chown -R deployer:deployer /home/deployer/.ssh

echo ""
echo -e "${GREEN}IMPORTANT: Add your SSH public key to /home/deployer/.ssh/authorized_keys${NC}"
echo ""
read -p "Paste your SSH public key (from ~/.ssh/hostinger_deploy.pub): " SSH_PUB_KEY
echo "$SSH_PUB_KEY" >> /home/deployer/.ssh/authorized_keys
echo -e "${GREEN}✓ SSH key added${NC}"

# Configure sudoers
echo ""
echo -e "${YELLOW}Configuring sudo permissions for deployment...${NC}"

cat > /etc/sudoers.d/deployer << 'EOF'
# Allow deployer to manage services without password
deployer ALL=(ALL) NOPASSWD: /bin/systemctl start homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl stop homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl reload homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl status homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload
deployer ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
deployer ALL=(ALL) NOPASSWD: /bin/chown -R www-data\:www-data /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/cp -r /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/rm -rf /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/mkdir -p /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/tar -xzf /tmp/*
deployer ALL=(ALL) NOPASSWD: /usr/bin/dotnet /var/www/homeservices*
EOF

chmod 440 /etc/sudoers.d/deployer
echo -e "${GREEN}✓ Sudo permissions configured${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Create Application Directory Structure${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ${APP_DIR}/{backend/publish,frontend/dist}
chown -R www-data:www-data ${APP_DIR}
chmod -R 755 ${APP_DIR}

echo -e "${GREEN}✓ Directory structure created${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Install .NET 8.0${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v dotnet &> /dev/null; then
    echo "✓ .NET already installed: $(dotnet --version)"
else
    wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
    dpkg -i packages-microsoft-prod.deb
    rm packages-microsoft-prod.deb
    apt update
    apt install -y dotnet-sdk-8.0 aspnetcore-runtime-8.0
    echo -e "${GREEN}✓ .NET 8.0 installed${NC}"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Install Node.js${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v node &> /dev/null; then
    echo "✓ Node.js already installed: $(node --version)"
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed${NC}"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Using SQLite Database${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "Using SQLite database (included with .NET, no separate server needed)"
echo "Database will be created automatically at: /var/www/homeservices/app.db"
echo -e "${GREEN}✓ SQLite configured${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 6: Install and Configure Nginx${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v nginx &> /dev/null; then
    echo "✓ Nginx already installed"
else
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
fi

# Configure Nginx
cat > /etc/nginx/sites-available/homeservices << NGINXCONF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Frontend
    location / {
        root ${APP_DIR}/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 50M;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
NGINXCONF

ln -sf /etc/nginx/sites-available/homeservices /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 7: Create Backend Systemd Service${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > /etc/systemd/system/homeservices-api.service << SERVICEEOF
[Unit]
Description=Home Services API
After=network.target

[Service]
WorkingDirectory=${APP_DIR}/backend/publish
ExecStart=/usr/bin/dotnet ${APP_DIR}/backend/publish/HomeServicesApp.HttpApi.Host.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=homeservices-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable homeservices-api

echo -e "${GREEN}✓ Systemd service created${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 8: Setup SSL with Let's Encrypt${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${YELLOW}Run this command to get SSL certificate:${NC}"
echo "certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL}"
echo ""
read -p "Install SSL certificate now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL}
    echo -e "${GREEN}✓ SSL certificate installed${NC}"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 9: Configure Firewall${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 10: Create Configuration File${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ${APP_DIR}/backend/publish
cat > ${APP_DIR}/backend/publish/appsettings.Production.json << APPSETTINGS
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}"
  },
  "App": {
    "CorsOrigins": "https://${DOMAIN},https://www.${DOMAIN}"
  },
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5000"
      }
    }
  }
}
APPSETTINGS

chown -R www-data:www-data ${APP_DIR}

echo -e "${GREEN}✓ Configuration created${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ VPS SETUP COMPLETED!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Important Information:${NC}"
echo ""
echo "SSH User: deployer"
echo "SSH Key: Add to ~/.ssh/authorized_keys on deployer user"
echo "App Directory: ${APP_DIR}"
echo "Database: ${DB_NAME}"
echo "Database User: ${DB_USER}"
echo "Domain: ${DOMAIN}"
echo ""
echo -e "${YELLOW}GitHub Secrets to Configure:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VPS_HOST: $(hostname -I | awk '{print $1}')"
echo "VPS_USER: deployer"
echo "DOMAIN_NAME: ${DOMAIN}"
echo "DB_NAME: ${DB_NAME}"
echo "DB_USER: ${DB_USER}"
echo "DB_PASSWORD: ${DB_PASSWORD}"
echo "VITE_API_BASE_URL: https://${DOMAIN}/api"
echo "VITE_AUTH_API_BASE_URL: https://${DOMAIN}/api"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test SSH connection: ssh deployer@$(hostname -I | awk '{print $1}')"
echo "2. Configure GitHub Secrets (see above)"
echo "3. Push to main branch to trigger deployment"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
