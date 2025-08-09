# Azure Deployment Quick Start Guide 🚀

## Prerequisites
Before you begin, ensure you have:

1. **Azure CLI** installed and logged in:
   ```bash
   # Install Azure CLI (if not already installed)
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   
   # Login to Azure
   az login
   ```

2. **GitHub repository** with your code pushed to the `main` branch

3. **Node.js 18+** and **.NET 9.0 SDK** installed locally for testing

## 🎯 One-Click Deployment

Run this single command to deploy everything to Azure:

```bash
./deploy-to-azure.sh
```

This script will:
- ✅ Create all Azure resources (Resource Group, SQL Database, Storage, App Service, Static Web App)
- ✅ Configure environment variables and connection strings
- ✅ Set up CORS policies
- ✅ Generate secure JWT secrets
- ✅ Provide GitHub secrets for CI/CD

## 📋 Manual Step-by-Step Deployment

If you prefer manual control, follow these steps:

### 1. Create Azure Resources
```bash
# Create resource group
az group create --name homeservices-rg --location "East US"

# Create SQL Server (replace PASSWORD with a strong password)
az sql server create \
  --name homeservices-sql-server \
  --resource-group homeservices-rg \
  --location "East US" \
  --admin-user homeservicesadmin \
  --admin-password "YourSecurePassword123!"

# Create database
az sql db create \
  --resource-group homeservices-rg \
  --server homeservices-sql-server \
  --name homeservices-db \
  --service-objective Basic
```

### 2. Deploy Backend to App Service
```bash
# Create App Service
az webapp create \
  --resource-group homeservices-rg \
  --plan homeservices-plan \
  --name homeservices-api \
  --runtime "DOTNETCORE:9.0"

# Configure app settings (see azure-deployment.md for complete list)
```

### 3. Deploy Frontend to Static Web Apps
```bash
# Create Static Web App (replace with your GitHub repo)
az staticwebapp create \
  --name homeservices-frontend \
  --resource-group homeservices-rg \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location "East US2" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

## 🔧 GitHub Secrets Configuration

After running the deployment script, add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Description |
|-------------|-------------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Backend deployment profile |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Frontend deployment token |
| `DATABASE_CONNECTION_STRING` | SQL connection for migrations |

## 🌐 Your Deployed Application

After deployment, your application will be available at:

- **Frontend**: `https://homeservices-frontend.azurestaticapps.net`
- **Backend API**: `https://homeservices-api.azurewebsites.net`
- **API Documentation**: `https://homeservices-api.azurewebsites.net/swagger`

## 🔄 Continuous Deployment

GitHub Actions are configured for automatic deployment:

- **Frontend**: Deploys when you push changes to `frontend/` directory
- **Backend**: Deploys when you push changes to `backend/` directory
- **Database**: Migrations run automatically with backend deployment

## 🛠️ Configuration Files Created

The deployment creates these configuration files:

```
├── .github/workflows/
│   ├── deploy-backend.yml      # Backend CI/CD pipeline
│   └── deploy-frontend.yml     # Frontend CI/CD pipeline
├── backend/src/HomeServicesApp.HttpApi.Host/
│   └── appsettings.Production.json  # Production backend config
├── frontend/
│   └── .env.production         # Production frontend config
├── azure-deployment.md         # Detailed deployment guide
├── deploy-to-azure.sh         # Automated deployment script
└── AZURE_QUICKSTART.md        # This quick start guide
```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check App Service logs
az webapp log tail --resource-group homeservices-rg --name homeservices-api

# Check database connectivity
az sql db show --resource-group homeservices-rg --server homeservices-sql-server --name homeservices-db
```

### Frontend Issues
```bash
# Check Static Web App status
az staticwebapp show --name homeservices-frontend --resource-group homeservices-rg

# View build logs in GitHub Actions tab
```

### Common Solutions
- **CORS errors**: Check CORS configuration in backend appsettings
- **Database connection**: Verify connection string and firewall rules
- **Build failures**: Check GitHub Actions logs for detailed error messages
- **Environment variables**: Ensure all required secrets are set in GitHub

## 💰 Cost Estimation

Approximate monthly costs for Azure resources:

- **App Service (B1)**: ~$13/month
- **SQL Database (Basic)**: ~$5/month
- **Storage Account**: ~$1/month
- **Static Web Apps**: Free tier available
- **Total**: ~$19/month

## 🚀 Next Steps

1. **Custom Domain**: Configure your own domain in Azure Static Web Apps
2. **SSL Certificate**: Automatically managed by Azure
3. **Monitoring**: Set up Application Insights for monitoring
4. **Scaling**: Configure auto-scaling based on traffic
5. **Backup**: Set up automated database backups

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Need help?** Check the detailed [azure-deployment.md](./azure-deployment.md) guide or open an issue in the repository.