# Hostinger Deployment Guide 🚀

## Overview
This guide covers deploying the Home Services Platform to Hostinger VPS/Cloud hosting.

## Prerequisites

### What You Need
- Hostinger VPS or Cloud Hosting plan
- Domain name (optional but recommended)
- SSH access to your VPS
- Basic Linux command line knowledge

### Hostinger VPS Plans
- **VPS 1**: 1 vCPU, 4GB RAM (Minimum for small-scale)
- **VPS 2**: 2 vCPU, 8GB RAM (Recommended for production)
- **VPS 3+**: Higher specs for scaling

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Hostinger VPS                   │
├─────────────────────────────────────────┤
│  Nginx (Reverse Proxy)                  │
│  ├── Port 80/443 → Frontend (Static)    │
│  └── /api → Backend (.NET Core)         │
├─────────────────────────────────────────┤
│  Backend (.NET 8.0)                     │
│  └── Port 5000 (Internal)               │
├─────────────────────────────────────────┤
│  Database (PostgreSQL/MySQL)            │
│  └── Port 5432/3306 (Internal)          │
└─────────────────────────────────────────┘
```

## Step-by-Step Deployment

### 1. Initial VPS Setup

```bash
# Connect to your Hostinger VPS via SSH
ssh root@your-vps-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip software-properties-common
```

### 2. Install .NET 8.0 Runtime

```bash
# Add Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Install .NET 8.0 Runtime
sudo apt update
sudo apt install -y dotnet-sdk-8.0 aspnetcore-runtime-8.0

# Verify installation
dotnet --version
```

### 3. Install and Configure PostgreSQL

```bash
# Install PostgreSQL (better compatibility than SQL Server on Linux)
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE homeservices;
CREATE USER homeservices_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE homeservices TO homeservices_user;
\q
EOF
```

### 4. Install Node.js and Build Frontend

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 5. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Deploy Application Files

```bash
# Create application directory
sudo mkdir -p /var/www/homeservices
sudo chown -R $USER:$USER /var/www/homeservices

# Clone or upload your repository
cd /var/www/homeservices
git clone <your-repository-url> .

# OR use SCP to upload files
# scp -r /local/path/to/project root@your-vps-ip:/var/www/homeservices
```

### 7. Build and Deploy Backend

```bash
cd /var/www/homeservices/backend

# Update database connection string
# Edit src/HomeServicesApp.HttpApi.Host/appsettings.json
sudo nano src/HomeServicesApp.HttpApi.Host/appsettings.json
```

Update the connection string:
```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=homeservices;Username=homeservices_user;Password=your_secure_password"
  }
}
```

```bash
# Build backend
dotnet restore
dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj \
  -c Release -o /var/www/homeservices/backend/publish

# Run migrations
dotnet /var/www/homeservices/backend/publish/HomeServicesApp.HttpApi.Host.dll --migrate-database
```

### 8. Build and Deploy Frontend

```bash
cd /var/www/homeservices/frontend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
VITE_API_BASE_URL=https://your-domain.com/api
VITE_AUTH_API_BASE_URL=https://your-domain.com/api
EOF

# Build for production
npm run build

# Copy build files to Nginx directory
sudo cp -r dist/* /var/www/homeservices/frontend/dist/
```

### 9. Configure Systemd Service for Backend

Create a systemd service to keep your backend running:

```bash
sudo nano /etc/systemd/system/homeservices-api.service
```

Add this configuration:
```ini
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
```

```bash
# Enable and start the service
sudo systemctl enable homeservices-api
sudo systemctl start homeservices-api

# Check status
sudo systemctl status homeservices-api
```

### 10. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/homeservices
```

Add this configuration:
```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (we'll add Let's Encrypt later)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Serve React app
    location / {
        root /var/www/homeservices/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to .NET Core
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File uploads
    client_max_body_size 50M;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/homeservices /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 11. Setup SSL with Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically configure Nginx for SSL
# Certificates auto-renew via cron job
```

### 12. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

## Environment Variables

### Backend Configuration

Edit `/var/www/homeservices/backend/publish/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=homeservices;Username=homeservices_user;Password=your_secure_password"
  },
  "App": {
    "CorsOrigins": "https://your-domain.com,https://www.your-domain.com"
  },
  "AuthServer": {
    "Authority": "https://your-domain.com",
    "Audience": "HomeServicesApp"
  }
}
```

### Frontend Environment

Your frontend `.env.production` should have:
```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_AUTH_API_BASE_URL=https://your-domain.com/api
```

## Monitoring and Maintenance

### View Application Logs

```bash
# Backend logs
sudo journalctl -u homeservices-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart homeservices-api

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Database Backup

```bash
# Create backup script
cat > /home/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/backups/database"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U homeservices_user -d homeservices > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /home/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/backup-db.sh") | crontab -
```

## Deployment Updates

### Update Application

```bash
# Pull latest changes
cd /var/www/homeservices
git pull

# Update backend
cd backend
dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj \
  -c Release -o /var/www/homeservices/backend/publish
sudo systemctl restart homeservices-api

# Update frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/homeservices/frontend/dist/
sudo systemctl reload nginx
```

## Alternative: Docker Deployment on Hostinger VPS

If you prefer Docker (easier management):

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose

# Deploy with Docker Compose
cd /var/www/homeservices
docker-compose up -d --build

# View logs
docker-compose logs -f
```

Update your `docker-compose.yml` for production:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: homeservices
      POSTGRES_USER: homeservices_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__Default=Host=postgres;Database=homeservices;Username=homeservices_user;Password=your_secure_password
    depends_on:
      - postgres
    restart: unless-stopped
    ports:
      - "5000:80"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_BASE_URL=https://your-domain.com/api
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

volumes:
  postgres_data:
```

## Performance Optimization

### 1. Enable Gzip Compression

Add to your Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. Setup Caching

```nginx
# Add to Nginx server block
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Connection Pooling

Already configured in your ASP.NET Core app, but verify in `appsettings.json`:
```json
"ConnectionStrings": {
  "Default": "Host=localhost;Database=homeservices;Username=homeservices_user;Password=your_secure_password;Pooling=true;MinPoolSize=5;MaxPoolSize=100"
}
```

## Troubleshooting

### Common Issues

#### 1. Backend not starting
```bash
# Check logs
sudo journalctl -u homeservices-api -n 50 --no-pager

# Check if port is in use
sudo netstat -tlnp | grep 5000

# Check .NET installation
dotnet --info
```

#### 2. Database connection issues
```bash
# Test PostgreSQL connection
psql -U homeservices_user -d homeservices -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

#### 3. Nginx errors
```bash
# Test Nginx config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Permission issues
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/homeservices

# Fix permissions
sudo chmod -R 755 /var/www/homeservices
```

## Cost Estimation

### Hostinger VPS Pricing (Approximate)
- **VPS 1** (4GB RAM): ~$5-8/month
- **VPS 2** (8GB RAM): ~$10-15/month
- **Domain**: ~$10/year
- **SSL**: Free (Let's Encrypt)

**Total Monthly Cost**: $10-20/month for production-ready hosting

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Setup firewall (UFW)
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Disable root SSH login
- [ ] Setup automatic security updates
- [ ] Configure fail2ban for SSH protection
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Keep .NET and Node.js updated

## Next Steps

1. **Get Hostinger VPS**: [Sign up here](https://www.hostinger.com/vps-hosting)
2. **Follow this guide** step by step
3. **Test your deployment** thoroughly
4. **Setup monitoring** (optional but recommended)
5. **Configure backups** for peace of mind

## Support Resources

- **Hostinger Support**: Available 24/7 via chat
- **Community**: Hostinger tutorials and forums
- **Documentation**: Official ASP.NET Core deployment docs

---

**Need help?** Feel free to reach out or check the troubleshooting section above.

🚀 **Ready to deploy!** Your Home Services Platform will be live on Hostinger in about 1-2 hours following this guide.
