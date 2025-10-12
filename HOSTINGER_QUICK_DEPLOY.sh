#!/bin/bash

###############################################################################
# Hostinger VPS Deployment Script for Home Services Platform
# 
# Usage: 
#   1. SSH into your Hostinger VPS
#   2. Upload this script: scp HOSTINGER_QUICK_DEPLOY.sh root@your-vps-ip:/root/
#   3. Run: chmod +x /root/HOSTINGER_QUICK_DEPLOY.sh
#   4. Execute: /root/HOSTINGER_QUICK_DEPLOY.sh
###############################################################################

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Home Services Platform - Hostinger Deployment  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
read -p "Enter your domain name (e.g., example.com): " DOMAIN
read -p "Enter your email for SSL certificate: " EMAIL
read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""
read -p "Enter Git repository URL: " GIT_REPO

APP_DIR="/var/www/homeservices"
DB_NAME="homeservices"
DB_USER="homeservices_user"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: System Update and Essential Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Install .NET 8.0 SDK and Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-8.0 aspnetcore-runtime-8.0
dotnet --version

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Install and Configure PostgreSQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
\q
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Install Node.js 18+"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Install and Configure Nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Clone Application Repository"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}
git clone ${GIT_REPO} ${APP_DIR}
cd ${APP_DIR}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Configure Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd ${APP_DIR}/backend

# Create connection string
CONN_STRING="Host=localhost;Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}"

# Update appsettings.json
cat > src/HomeServicesApp.HttpApi.Host/appsettings.Production.json << EOF
{
  "ConnectionStrings": {
    "Default": "${CONN_STRING}"
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
EOF

# Build and publish backend
dotnet restore
dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj \
  -c Release -o ${APP_DIR}/backend/publish

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Build Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd ${APP_DIR}/frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_BASE_URL=https://${DOMAIN}/api
VITE_AUTH_API_BASE_URL=https://${DOMAIN}/api
EOF

# Install and build
npm install
npm run build

# Create frontend directory
sudo mkdir -p ${APP_DIR}/frontend/dist
sudo cp -r dist/* ${APP_DIR}/frontend/dist/

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Create Systemd Service for Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo tee /etc/systemd/system/homeservices-api.service > /dev/null << EOF
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
EOF

# Fix permissions
sudo chown -R www-data:www-data ${APP_DIR}

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable homeservices-api
sudo systemctl start homeservices-api

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Configure Nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo tee /etc/nginx/sites-available/homeservices > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    # Frontend - Serve React app
    location / {
        root APP_DIR_PLACEHOLDER/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to .NET Core
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
NGINXCONF

# Replace placeholders
sudo sed -i "s|DOMAIN_PLACEHOLDER|${DOMAIN}|g" /etc/nginx/sites-available/homeservices
sudo sed -i "s|APP_DIR_PLACEHOLDER|${APP_DIR}|g" /etc/nginx/sites-available/homeservices

# Enable site
sudo ln -sf /etc/nginx/sites-available/homeservices /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 11: Setup SSL with Let's Encrypt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${EMAIL}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 12: Configure Firewall"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 13: Setup Database Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
mkdir -p /home/backups/database
cat > /home/backup-db.sh << 'BACKUPSCRIPT'
#!/bin/bash
BACKUP_DIR="/home/backups/database"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
export PGPASSWORD="DB_PASSWORD_PLACEHOLDER"
pg_dump -U DB_USER_PLACEHOLDER -d DB_NAME_PLACEHOLDER > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
BACKUPSCRIPT

sed -i "s|DB_PASSWORD_PLACEHOLDER|${DB_PASSWORD}|g" /home/backup-db.sh
sed -i "s|DB_USER_PLACEHOLDER|${DB_USER}|g" /home/backup-db.sh
sed -i "s|DB_NAME_PLACEHOLDER|${DB_NAME}|g" /home/backup-db.sh
chmod +x /home/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/backup-db.sh") | crontab -

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your Home Services Platform is now live at:"
echo "🌐 https://${DOMAIN}"
echo ""
echo "Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo systemctl status homeservices-api --no-pager
echo ""
echo "Useful Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "View API logs:       sudo journalctl -u homeservices-api -f"
echo "Restart API:         sudo systemctl restart homeservices-api"
echo "View Nginx logs:     sudo tail -f /var/log/nginx/access.log"
echo "Restart Nginx:       sudo systemctl restart nginx"
echo "Database backup:     /home/backup-db.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Happy Hosting on Hostinger!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
