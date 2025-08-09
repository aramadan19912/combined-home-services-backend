# Azure Deployment Guide for Home Services App

## Overview
This guide covers deploying the Home Services application to Azure with:
- Frontend: Azure Static Web Apps
- Backend: Azure App Service
- Database: Azure SQL Database
- Storage: Azure Blob Storage

## Prerequisites
- Azure CLI installed
- Azure subscription
- GitHub repository
- .NET 9.0 SDK
- Node.js 18+

## 1. Azure Resource Setup

### Create Resource Group
```bash
az group create --name homeservices-rg --location "East US"
```

### Create Azure SQL Database
```bash
# Create SQL Server
az sql server create \
  --name homeservices-sql-server \
  --resource-group homeservices-rg \
  --location "East US" \
  --admin-user homeservicesadmin \
  --admin-password "YourSecurePassword123!"

# Create Database
az sql db create \
  --resource-group homeservices-rg \
  --server homeservices-sql-server \
  --name homeservices-db \
  --service-objective Basic

# Configure firewall for Azure services
az sql server firewall-rule create \
  --resource-group homeservices-rg \
  --server homeservices-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Create Storage Account
```bash
az storage account create \
  --name homeservicesstorageacc \
  --resource-group homeservices-rg \
  --location "East US" \
  --sku Standard_LRS \
  --kind StorageV2

# Create blob container for file uploads
az storage container create \
  --name uploads \
  --account-name homeservicesstorageacc \
  --public-access blob
```

### Create App Service Plan and App Service
```bash
# Create App Service Plan
az appservice plan create \
  --name homeservices-plan \
  --resource-group homeservices-rg \
  --location "East US" \
  --sku B1 \
  --is-linux

# Create App Service for Backend
az webapp create \
  --resource-group homeservices-rg \
  --plan homeservices-plan \
  --name homeservices-api \
  --runtime "DOTNETCORE:9.0"
```

## 2. Backend Deployment Configuration

### Update appsettings.json for Production
The backend will need production configuration files and environment variables.

### Database Connection String
Get your connection string:
```bash
az sql db show-connection-string \
  --client ado.net \
  --name homeservices-db \
  --server homeservices-sql-server
```

### Configure App Service Environment Variables
```bash
# Set connection string
az webapp config connection-string set \
  --resource-group homeservices-rg \
  --name homeservices-api \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="Server=tcp:homeservices-sql-server.database.windows.net,1433;Initial Catalog=homeservices-db;Persist Security Info=False;User ID=homeservicesadmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Set app settings
az webapp config appsettings set \
  --resource-group homeservices-rg \
  --name homeservices-api \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    Jwt__Key="YourSuperSecretJWTKeyForProduction123!" \
    Jwt__Issuer="https://homeservices-api.azurewebsites.net" \
    Jwt__Audience="https://homeservices-frontend.azurestaticapps.net" \
    FileStorage__ConnectionString="DefaultEndpointsProtocol=https;AccountName=homeservicesstorageacc;..." \
    CORS__AllowedOrigins="https://homeservices-frontend.azurestaticapps.net"
```

## 3. Frontend Deployment - Azure Static Web Apps

### Create Static Web App
```bash
az staticwebapp create \
  --name homeservices-frontend \
  --resource-group homeservices-rg \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location "East US2" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

## 4. Environment Variables Setup

### Backend Environment Variables (Azure App Service)
- `ConnectionStrings__Default`: Azure SQL connection string
- `Jwt__Key`: JWT secret key for production
- `Jwt__Issuer`: Backend API URL
- `Jwt__Audience`: Frontend URL
- `FileStorage__ConnectionString`: Azure Blob Storage connection string
- `CORS__AllowedOrigins`: Frontend domain

### Frontend Environment Variables (Static Web App)
Create production environment file in frontend:
```bash
VITE_API_BASE_URL=https://homeservices-api.azurewebsites.net
VITE_ENVIRONMENT=production
```

## 5. CI/CD Setup with GitHub Actions

The deployment will use GitHub Actions for continuous deployment.

## 6. Custom Domain and SSL
- Configure custom domain in Azure Static Web Apps
- SSL certificates are automatically managed by Azure

## 7. Monitoring and Logging
- Application Insights for monitoring
- Azure Monitor for logs and metrics

## 8. Security Considerations
- Enable HTTPS only
- Configure proper CORS policies
- Use Azure Key Vault for sensitive configuration
- Enable Azure AD authentication if needed

## 9. Scaling and Performance
- Auto-scaling configuration for App Service
- CDN integration for static assets
- Database performance monitoring

## 10. Backup and Disaster Recovery
- Database automated backups
- App Service backup configuration
- Multiple region deployment for high availability

## Cost Optimization
- Use appropriate service tiers
- Monitor usage and optimize resources
- Consider Azure Reserved Instances for production

## Next Steps
1. Run the Azure CLI commands above
2. Configure GitHub Actions (see workflow files)
3. Update application configuration files
4. Deploy and test the application
5. Configure monitoring and alerts

## Troubleshooting
- Check App Service logs in Azure Portal
- Verify environment variables are set correctly
- Ensure database connectivity
- Validate CORS configuration