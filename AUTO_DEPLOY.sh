#!/bin/bash

###############################################################################
# Automated Deployment Script for Hostinger VPS
# 
# This script does EVERYTHING automatically!
# Just run it and answer a few simple questions.
###############################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 AUTOMATED DEPLOYMENT - Home Services Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will:"
echo "  ✅ Update your system"
echo "  ✅ Install all dependencies"
echo "  ✅ Setup database"
echo "  ✅ Configure web server"
echo "  ✅ Deploy your application"
echo ""
echo "Just answer a few questions and it does the rest!"
echo ""

# Get user inputs
read -p "Your email address: " EMAIL
read -sp "Create a database password (write it down!): " DB_PASSWORD
echo ""
echo ""

VPS_IP=$(hostname -I | awk '{print $1}')
DOMAIN=${VPS_IP}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting automated setup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essentials
echo "🔧 Installing essential tools..."
apt install -y curl wget git unzip software-properties-common

# Install .NET 8.0
echo "⚙️ Installing .NET 8.0..."
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
apt update
apt install -y dotnet-sdk-8.0 aspnetcore-runtime-8.0

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database
echo "📊 Creating database..."
sudo -u postgres psql << EOF
CREATE DATABASE homeservices;
CREATE USER homeservices_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE homeservices TO homeservices_user;
ALTER DATABASE homeservices OWNER TO homeservices_user;
\q
EOF

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /var/www/homeservices/{backend/publish,frontend/dist}

# Create deployer user
echo "👤 Creating deployer user..."
if ! id "deployer" &>/dev/null; then
    adduser --disabled-password --gecos "" deployer
    usermod -aG sudo deployer
fi

mkdir -p /home/deployer/.ssh
touch /home/deployer/.ssh/authorized_keys
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
chown -R deployer:deployer /home/deployer/.ssh

# Configure sudoers for deployer
echo "🔐 Configuring permissions..."
cat > /etc/sudoers.d/deployer << 'SUDOEOF'
deployer ALL=(ALL) NOPASSWD: /bin/systemctl start homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl stop homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
deployer ALL=(ALL) NOPASSWD: /bin/systemctl status homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/chown -R www-data\:www-data /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/cp -r /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/rm -rf /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/mkdir -p /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/tar -xzf /tmp/*
SUDOEOF
chmod 440 /etc/sudoers.d/deployer

# Create backend systemd service
echo "⚙️ Creating backend service..."
cat > /etc/systemd/system/homeservices-api.service << SERVICEEOF
[Unit]
Description=Home Services API
After=network.target

[Service]
WorkingDirectory=/var/www/homeservices/backend/publish
ExecStart=/usr/bin/dotnet /var/www/homeservices/backend/publish/HomeServicesApp.HttpApi.Host.dll
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

# Create backend config
echo "📝 Creating backend configuration..."
mkdir -p /var/www/homeservices/backend/publish
cat > /var/www/homeservices/backend/publish/appsettings.Production.json << APPSETTINGS
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=homeservices;Username=homeservices_user;Password=${DB_PASSWORD}"
  },
  "App": {
    "CorsOrigins": "http://${DOMAIN}"
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

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/homeservices << 'NGINXCONF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/homeservices/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

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

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Set permissions
chown -R www-data:www-data /var/www/homeservices

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VPS SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 SAVE THIS INFORMATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "VPS IP: ${VPS_IP}"
echo "Database Name: homeservices"
echo "Database User: homeservices_user"
echo "Database Password: ${DB_PASSWORD}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 NEXT: Generate SSH Key for GitHub Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "On your LOCAL computer, run:"
echo ""
echo "  ssh-keygen -t ed25519 -C \"github\" -f ~/.ssh/hostinger_deploy"
echo "  cat ~/.ssh/hostinger_deploy.pub"
echo ""
echo "Copy the output and add to /home/deployer/.ssh/authorized_keys"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Configure these GitHub Secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "SSH_PRIVATE_KEY: cat ~/.ssh/hostinger_deploy"
echo "VPS_HOST: ${VPS_IP}"
echo "VPS_USER: deployer"
echo "DOMAIN_NAME: ${VPS_IP}"
echo "DB_NAME: homeservices"
echo "DB_USER: homeservices_user"
echo "DB_PASSWORD: ${DB_PASSWORD}"
echo "VITE_API_BASE_URL: http://${VPS_IP}/api"
echo "VITE_AUTH_API_BASE_URL: http://${VPS_IP}/api"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your VPS is ready! Configure GitHub Secrets and deploy! 🚀"
echo ""
