# ⚡ Azure Deployment Quick Reference

## 🚀 One-Command Deploy

```bash
chmod +x quick-deploy-azure.sh && ./quick-deploy-azure.sh
```

## 📋 Prerequisites

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Verify Docker
docker --version
```

## 🔧 Common Commands

### Deployment

```bash
# Quick interactive deploy
./quick-deploy-azure.sh

# Full deploy script
./deploy-azure.sh

# Provision only
./infra/azure/provision.sh

# Deploy with Bicep
./infra/azure/deploy-bicep.sh
```

### Monitoring

```bash
# Stream logs
az webapp log tail -g hsapp-rg -n hsapp-frontend-XXXXX

# Check health
curl https://hsapp-frontend-XXXXX.azurewebsites.net/health

# Browse app
az webapp browse -g hsapp-rg -n hsapp-frontend-XXXXX
```

### Management

```bash
# Restart app
az webapp restart -g hsapp-rg -n hsapp-api-XXXXX

# View settings
az webapp config appsettings list -g hsapp-rg -n hsapp-api-XXXXX

# Update setting
az webapp config appsettings set -g hsapp-rg -n hsapp-api-XXXXX --settings KEY=VALUE

# Scale up
az appservice plan update -g hsapp-rg -n hsapp-asp --sku P1v3

# Scale out
az appservice plan update -g hsapp-rg -n hsapp-asp --number-of-workers 3
```

### Docker

```bash
# Login to ACR
az acr login -n hsappacr12345

# Build and push API
docker build -f backend/Dockerfile -t hsappacr12345.azurecr.io/hsapp-api:latest backend
docker push hsappacr12345.azurecr.io/hsapp-api:latest

# Build and push Auth
docker build -f backend/AuthServer.Dockerfile -t hsappacr12345.azurecr.io/hsapp-auth:latest backend
docker push hsappacr12345.azurecr.io/hsapp-auth:latest

# Build and push Frontend
docker build -f frontend/Dockerfile -t hsappacr12345.azurecr.io/hsapp-frontend:latest frontend
docker push hsappacr12345.azurecr.io/hsapp-frontend:latest
```

### Local Testing

```bash
# Run all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build frontend
```

## 🔐 GitHub Actions Setup

### Required Secrets

```
AZURE_CLIENT_ID          (from Azure AD app)
AZURE_TENANT_ID          (from az account show)
AZURE_SUBSCRIPTION_ID    (from az account show)
```

### After Provisioning

```
RESOURCE_GROUP
ACR_NAME
ACR_LOGIN_SERVER
WEBAPP_API
WEBAPP_AUTH
WEBAPP_FRONTEND
```

### Optional Configuration

```
DATABASE_PROVIDER        (Sqlite or PostgreSql)
PG_CONN_STR             (if using PostgreSQL)
APP_CORS_ORIGINS
AUTH_SELF_URL
AUTH_CLIENT_URL
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
az webapp log tail -g hsapp-rg -n hsapp-api-XXXXX

# Verify port
az webapp config appsettings list -g hsapp-rg -n hsapp-api-XXXXX | grep WEBSITES_PORT

# Check container image
az webapp config show -g hsapp-rg -n hsapp-api-XXXXX --query linuxFxVersion
```

### ACR Pull Issues

```bash
# Check managed identity
az webapp identity show -g hsapp-rg -n hsapp-api-XXXXX

# Grant ACR pull
ACR_ID=$(az acr show -n hsappacr12345 --query id -o tsv)
PRINCIPAL_ID=$(az webapp identity show -g hsapp-rg -n hsapp-api-XXXXX --query principalId -o tsv)
az role assignment create --assignee-object-id $PRINCIPAL_ID --assignee-principal-type ServicePrincipal --role AcrPull --scope $ACR_ID
```

### CORS Errors

```bash
# Update API CORS
az webapp config appsettings set -g hsapp-rg -n hsapp-api-XXXXX \
  --settings App__CorsOrigins="https://hsapp-frontend-XXXXX.azurewebsites.net"

# Update Auth CORS
az webapp config appsettings set -g hsapp-rg -n hsapp-auth-XXXXX \
  --settings App__CorsOrigins="https://hsapp-frontend-XXXXX.azurewebsites.net"
```

## 🗑️ Cleanup

```bash
# Delete everything
az group delete -n hsapp-rg --yes --no-wait

# Or use GitHub Actions "Azure Destroy Resources" workflow
```

## 📊 Cost Estimate

| Component | Dev | Prod |
|-----------|-----|------|
| App Service | $13 | $78 |
| PostgreSQL | - | $30 |
| ACR | $5 | $5 |
| **Total/Month** | **$18** | **$113** |

## 🌐 URLs After Deployment

```
Frontend:    https://hsapp-frontend-XXXXX.azurewebsites.net
API:         https://hsapp-api-XXXXX.azurewebsites.net
Auth Server: https://hsapp-auth-XXXXX.azurewebsites.net
```

## 📱 Health Endpoints

```bash
curl https://hsapp-frontend-XXXXX.azurewebsites.net/health
curl https://hsapp-api-XXXXX.azurewebsites.net/health
curl https://hsapp-auth-XXXXX.azurewebsites.net/health
```

## 🎯 Environment Variables

### API App

```bash
WEBSITES_PORT=8080
Database__Provider=Sqlite
ConnectionStrings__Default=Data Source=/data/app.db
App__CorsOrigins=https://hsapp-frontend-XXXXX.azurewebsites.net
App__SelfUrl=https://hsapp-api-XXXXX.azurewebsites.net
AuthServer__Authority=https://hsapp-auth-XXXXX.azurewebsites.net
AuthServer__RequireHttpsMetadata=true
```

### Auth Server

```bash
WEBSITES_PORT=8081
Database__Provider=Sqlite
ConnectionStrings__Default=Data Source=/data/auth.db
App__CorsOrigins=https://hsapp-frontend-XXXXX.azurewebsites.net
App__SelfUrl=https://hsapp-auth-XXXXX.azurewebsites.net
App__ClientUrl=https://hsapp-frontend-XXXXX.azurewebsites.net
App__RedirectAllowedUrls=https://hsapp-frontend-XXXXX.azurewebsites.net
```

### Frontend

```bash
WEBSITES_PORT=8080
VITE_API_BASE_URL=https://hsapp-auth-XXXXX.azurewebsites.net
VITE_API_HOST_URL=https://hsapp-api-XXXXX.azurewebsites.net/api/v1
VITE_ENVIRONMENT=production
```

## 📚 Documentation

- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Complete deployment overview
- [AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) - Original guide

---

**Need help?** Check the full guides above or run `./quick-deploy-azure.sh` for interactive deployment.