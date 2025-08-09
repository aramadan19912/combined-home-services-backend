# Deployment Guide 🚀

## Overview
This guide covers deploying the fully integrated Home Services application with both frontend and backend components.

## Pre-deployment Checklist ✅

### Backend Requirements
- [ ] All API endpoints implemented and tested
- [ ] Database properly configured and migrated
- [ ] Authentication/JWT configuration verified
- [ ] File upload storage configured
- [ ] CORS policies set for your domains
- [ ] SSL certificates configured
- [ ] Environment variables set

### Frontend Requirements
- [ ] API integration tested locally
- [ ] Environment variables configured
- [ ] Build process verified (`npm run build`)
- [ ] Performance optimizations applied
- [ ] Error handling tested

## Environment Configuration 🔧

### Backend Environment Variables
```bash
# Database
ConnectionStrings__Default=your-database-connection-string

# JWT Configuration
Jwt__Key=your-jwt-secret-key
Jwt__Issuer=https://your-api.com
Jwt__Audience=https://your-frontend.com
Jwt__ExpiryInHours=2

# File Storage
FileStorage__Path=/uploads
FileStorage__MaxSizeInMB=10

# CORS
CORS__AllowedOrigins=https://your-frontend.com,https://www.your-frontend.com

# Firebase (for notifications)
Firebase__ProjectId=your-firebase-project
Firebase__PrivateKey=your-firebase-private-key
```

### Frontend Environment Variables
```bash
# Production
VITE_API_BASE_URL=https://your-auth-api.com
VITE_API_HOST_URL=https://your-main-api.com/api/v1
VITE_ENVIRONMENT=production

# Optional Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GA_MEASUREMENT_ID=your-google-analytics-id
```

## Deployment Options 🌐

### Option 1: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj", "src/HomeServicesApp.HttpApi.Host/"]
RUN dotnet restore "src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj"
COPY . .
WORKDIR "/src/src/HomeServicesApp.HttpApi.Host"
RUN dotnet build "HomeServicesApp.HttpApi.Host.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HomeServicesApp.HttpApi.Host.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HomeServicesApp.HttpApi.Host.dll"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:80"
    environment:
      - ConnectionStrings__Default=Server=db;Database=HomeServices;User=sa;Password=YourPassword123!
      - Jwt__Key=${JWT_SECRET}
      - CORS__AllowedOrigins=https://your-frontend.com
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com
      - VITE_API_HOST_URL=https://api.yourdomain.com/api/v1

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

volumes:
  sqldata:
```

### Option 2: Cloud Deployment

#### Azure Deployment
```bash
# Backend - Deploy to Azure App Service
az webapp up --name your-backend-app --resource-group your-rg --sku B1

# Frontend - Deploy to Azure Static Web Apps
az staticwebapp create \
  --name your-frontend-app \
  --resource-group your-rg \
  --source https://github.com/your-username/your-repo \
  --location "East US 2" \
  --branch main \
  --app-location "frontend" \
  --output-location "dist"
```

#### AWS Deployment
```bash
# Backend - Deploy to Elastic Beanstalk
eb init -p "64bit Amazon Linux 2 v2.3.0 running .NET Core" your-backend-app
eb create production
eb deploy

# Frontend - Deploy to S3 + CloudFront
aws s3 sync dist/ s3://your-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Option 3: Traditional VPS Deployment

#### Backend Setup (Ubuntu/CentOS)
```bash
# Install .NET 8
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y aspnetcore-runtime-8.0

# Setup service
sudo systemctl enable your-backend-service
sudo systemctl start your-backend-service

# Configure Nginx reverse proxy
sudo nginx -t && sudo systemctl reload nginx
```

#### Frontend Setup
```bash
# Build and deploy
npm run build
sudo cp -r dist/* /var/www/html/

# Configure Nginx
sudo systemctl reload nginx
```

## Nginx Configuration 🔧

### Backend Reverse Proxy
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Frontend Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/html;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;
}
```

## SSL Configuration 🔒

### Using Certbot (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Setup 💾

### SQL Server
```sql
-- Create database
CREATE DATABASE HomeServices;

-- Run migrations
dotnet ef database update --project src/HomeServicesApp.EntityFrameworkCore
```

### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
sqlcmd -S localhost -U sa -P $SA_PASSWORD -Q "BACKUP DATABASE HomeServices TO DISK = '/backup/homeservices_$DATE.bak'"

# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Monitoring Setup 📊

### Health Checks
```bash
# Backend health check
curl https://api.yourdomain.com/health

# Frontend health check
curl https://yourdomain.com
```

### Performance Monitoring
```javascript
// Use the built-in performance monitor
console.log(performanceMonitor.getAllMetrics());

// Check API cache efficiency
console.log(apiCache.getStats());
```

### Log Monitoring
```bash
# Backend logs
sudo journalctl -u your-backend-service -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Scaling Considerations 📈

### Load Balancing
```nginx
upstream backend {
    server 10.0.1.10:5000;
    server 10.0.1.11:5000;
    server 10.0.1.12:5000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### CDN Integration
```javascript
// Update API client for CDN
const CDN_URL = 'https://cdn.yourdomain.com';
```

## Troubleshooting 🔧

### Common Issues

1. **CORS Errors**
   ```bash
   # Check backend CORS configuration
   curl -H "Origin: https://yourdomain.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS https://api.yourdomain.com/api/service
   ```

2. **File Upload Issues**
   ```bash
   # Check file permissions
   sudo chown -R www-data:www-data /uploads
   sudo chmod 755 /uploads
   ```

3. **Database Connection**
   ```bash
   # Test connection
   sqlcmd -S your-server -U your-user -P your-password -Q "SELECT 1"
   ```

4. **API Integration Issues**
   ```javascript
   // Use integration test utility
   await runFullIntegrationTest();
   ```

### Performance Issues
```bash
# Check resource usage
htop
df -h
free -m

# Check API response times
curl -w "@curl-format.txt" -s -o /dev/null https://api.yourdomain.com/api/service
```

## Security Checklist 🔐

- [ ] HTTPS configured for all domains
- [ ] JWT secrets properly configured
- [ ] Database credentials secured
- [ ] File upload validation implemented
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Security headers configured
- [ ] Regular security updates applied

## Maintenance 🛠️

### Regular Tasks
- Database backups (daily)
- Log rotation (weekly)
- Security updates (monthly)
- Performance monitoring (ongoing)
- Cache cleanup (automatic)

### Update Process
1. Test in staging environment
2. Create database backup
3. Deploy backend updates
4. Deploy frontend updates
5. Verify functionality
6. Monitor for issues

The application is now ready for production deployment! Follow this guide carefully and test each step thoroughly. 🎉