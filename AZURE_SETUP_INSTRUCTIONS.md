# Azure Deployment Setup Instructions 🚀

This guide will help you deploy the Home Services application to Microsoft Azure.

## Prerequisites ✅

Before you begin, ensure you have:

1. **Azure Account** with an active subscription
   - [Create a free Azure account](https://azure.microsoft.com/free/)

2. **Azure CLI** installed locally
   ```bash
   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   
   # Verify installation
   az --version
   ```

3. **Docker** installed locally
   ```bash
   # Verify Docker installation
   docker --version
   ```

4. **Git** repository (for GitHub Actions deployment)

## Deployment Options 🎯

You can deploy using either:
- **Option A**: GitHub Actions (Recommended for CI/CD)
- **Option B**: Local deployment script

---

## Option A: GitHub Actions Deployment (Recommended)

### Step 1: Set up Azure Service Principal with OIDC

1. **Create an Azure AD Application:**
   ```bash
   az ad app create --display-name "HomeServicesApp-GitHub"
   ```
   
   Save the `appId` (this is your `AZURE_CLIENT_ID`)

2. **Create a Service Principal:**
   ```bash
   az ad sp create --id <appId>
   ```
   
   Save the output values:
   - `appId` → `AZURE_CLIENT_ID`
   - Get tenant ID: `az account show --query tenantId -o tsv` → `AZURE_TENANT_ID`
   - Get subscription ID: `az account show --query id -o tsv` → `AZURE_SUBSCRIPTION_ID`

3. **Configure Federated Credentials for GitHub:**
   ```bash
   az ad app federated-credential create \
     --id <appId> \
     --parameters '{
       "name": "GitHubActions",
       "issuer": "https://token.actions.githubusercontent.com",
       "subject": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:ref:refs/heads/main",
       "audiences": ["api://AzureADTokenExchange"]
     }'
   ```

4. **Assign Contributor role to the Service Principal:**
   ```bash
   az role assignment create \
     --assignee <appId> \
     --role Contributor \
     --scope /subscriptions/<SUBSCRIPTION_ID>
   ```

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Required Secrets:
```
AZURE_TENANT_ID=<your-tenant-id>
AZURE_SUBSCRIPTION_ID=<your-subscription-id>
AZURE_CLIENT_ID=<your-client-id>
```

### Step 3: Provision Azure Resources

1. Go to your GitHub repository → Actions
2. Run the **"Azure Provision"** workflow
3. The workflow will output resource names - save these values as GitHub secrets:

```
RESOURCE_GROUP=hsapp-rg
ACR_NAME=hsappacr12345
ACR_LOGIN_SERVER=hsappacr12345.azurecr.io
WEBAPP_API=hsapp-api-12345
WEBAPP_AUTH=hsapp-auth-12345
WEBAPP_FRONTEND=hsapp-frontend-12345
```

### Step 4: Grant ACR Push Permission

The GitHub Actions workflow needs permission to push images to ACR:

```bash
# Get the ACR resource ID
ACR_ID=$(az acr show --name <ACR_NAME> --query id -o tsv)

# Grant AcrPush role to the service principal
az role assignment create \
  --assignee <AZURE_CLIENT_ID> \
  --role AcrPush \
  --scope $ACR_ID
```

### Step 5: Optional Configuration Secrets

Add these optional secrets for advanced configuration:

```
# Database (default: Sqlite)
DATABASE_PROVIDER=Sqlite

# For PostgreSQL:
# DATABASE_PROVIDER=PostgreSql
# PG_CONN_STR=Server=yourserver.postgres.database.azure.com;Database=hsapp;...

# CORS and URLs (auto-configured if not set)
APP_CORS_ORIGINS=https://your-custom-domain.com
AUTH_SELF_URL=https://auth.your-domain.com
AUTH_CLIENT_URL=https://your-domain.com
```

### Step 6: Deploy!

1. Push to `main` branch or manually trigger the **"Azure Deploy"** workflow
2. The workflow will:
   - Build Docker images for API, Auth Server, and Frontend
   - Push images to Azure Container Registry
   - Deploy to Azure Web Apps
   - Configure environment variables
   - Restart services

3. Access your application:
   ```
   https://<WEBAPP_FRONTEND>.azurewebsites.net
   ```

---

## Option B: Local Deployment Script

### Step 1: Install Prerequisites

Ensure Azure CLI and Docker are installed (see Prerequisites section).

### Step 2: Login to Azure

```bash
az login
```

### Step 3: Run Deployment Script

```bash
# Make the script executable
chmod +x deploy-azure.sh

# Run the deployment
./deploy-azure.sh
```

The script will:
1. Check Azure login status
2. Provision infrastructure (or use existing)
3. Build and push Docker images
4. Deploy to Web Apps
5. Configure environment variables
6. Display application URLs

---

## Manual Deployment Steps (Advanced)

If you prefer manual control:

### 1. Provision Infrastructure

```bash
chmod +x infra/azure/provision.sh
./infra/azure/provision.sh
```

Save the output values.

### 2. Build and Push Images

```bash
# Login to ACR
az acr login -n <ACR_NAME>

# Build and push API
docker build -f backend/Dockerfile -t <ACR_LOGIN_SERVER>/hsapp-api:latest backend
docker push <ACR_LOGIN_SERVER>/hsapp-api:latest

# Build and push Auth Server
docker build -f backend/AuthServer.Dockerfile -t <ACR_LOGIN_SERVER>/hsapp-auth:latest backend
docker push <ACR_LOGIN_SERVER>/hsapp-auth:latest

# Build and push Frontend
docker build -f frontend/Dockerfile -t <ACR_LOGIN_SERVER>/hsapp-frontend:latest frontend
docker push <ACR_LOGIN_SERVER>/hsapp-frontend:latest
```

### 3. Deploy to Web Apps

```bash
# Deploy API
az webapp config container set \
  -g <RESOURCE_GROUP> \
  -n <WEBAPP_API> \
  --docker-custom-image-name <ACR_LOGIN_SERVER>/hsapp-api:latest

# Deploy Auth Server
az webapp config container set \
  -g <RESOURCE_GROUP> \
  -n <WEBAPP_AUTH> \
  --docker-custom-image-name <ACR_LOGIN_SERVER>/hsapp-auth:latest

# Deploy Frontend
az webapp config container set \
  -g <RESOURCE_GROUP> \
  -n <WEBAPP_FRONTEND> \
  --docker-custom-image-name <ACR_LOGIN_SERVER>/hsapp-frontend:latest
```

### 4. Configure App Settings

See the deployment workflows or scripts for complete app settings configuration.

---

## Testing Local Docker Build 🧪

Before deploying to Azure, test locally:

```bash
# Build and run all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8080
# Auth Server: http://localhost:8081
```

---

## Database Configuration 💾

### SQLite (Default)

The default configuration uses SQLite, which is suitable for:
- Development
- Testing
- Low-traffic applications

### PostgreSQL (Production Recommended)

For production, use Azure Database for PostgreSQL:

1. **Create PostgreSQL Server:**
   ```bash
   az postgres flexible-server create \
     --name hsapp-db \
     --resource-group hsapp-rg \
     --location eastus \
     --admin-user hsappadmin \
     --admin-password <SecurePassword123!> \
     --sku-name Standard_B1ms \
     --tier Burstable \
     --storage-size 32
   ```

2. **Configure firewall:**
   ```bash
   # Allow Azure services
   az postgres flexible-server firewall-rule create \
     --resource-group hsapp-rg \
     --name hsapp-db \
     --rule-name AllowAzure \
     --start-ip-address 0.0.0.0 \
     --end-ip-address 0.0.0.0
   ```

3. **Update GitHub secrets or environment variables:**
   ```
   DATABASE_PROVIDER=PostgreSql
   PG_CONN_STR=Server=hsapp-db.postgres.database.azure.com;Database=hsapp;Port=5432;User Id=hsappadmin;Password=<SecurePassword123!>;Ssl Mode=Require;
   ```

---

## Custom Domain Setup 🌐

### Step 1: Add Custom Domain

```bash
# Add custom domain to Web App
az webapp config hostname add \
  --webapp-name <WEBAPP_FRONTEND> \
  --resource-group <RESOURCE_GROUP> \
  --hostname yourdomain.com

# Repeat for API and Auth subdomains
az webapp config hostname add \
  --webapp-name <WEBAPP_API> \
  --resource-group <RESOURCE_GROUP> \
  --hostname api.yourdomain.com
```

### Step 2: Create SSL Binding

```bash
# Create free managed certificate
az webapp config ssl create \
  --resource-group <RESOURCE_GROUP> \
  --name <WEBAPP_FRONTEND> \
  --hostname yourdomain.com

# Bind certificate
az webapp config ssl bind \
  --resource-group <RESOURCE_GROUP> \
  --name <WEBAPP_FRONTEND> \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

---

## Monitoring and Troubleshooting 🔍

### View Logs

```bash
# Stream frontend logs
az webapp log tail -g <RESOURCE_GROUP> -n <WEBAPP_FRONTEND>

# Stream API logs
az webapp log tail -g <RESOURCE_GROUP> -n <WEBAPP_API>

# Stream Auth logs
az webapp log tail -g <RESOURCE_GROUP> -n <WEBAPP_AUTH>
```

### Health Checks

```bash
# Check frontend
curl https://<WEBAPP_FRONTEND>.azurewebsites.net/health

# Check API
curl https://<WEBAPP_API>.azurewebsites.net/health

# Check Auth
curl https://<WEBAPP_AUTH>.azurewebsites.net/health
```

### Common Issues

1. **Container not starting:**
   - Check logs: `az webapp log tail`
   - Verify port settings: `az webapp config appsettings list`
   - Ensure `WEBSITES_PORT` matches Dockerfile EXPOSE

2. **Image pull fails:**
   - Verify managed identity has AcrPull role
   - Check ACR login server URL

3. **CORS errors:**
   - Update `App__CorsOrigins` in app settings
   - Include protocol (https://)

---

## Scaling Configuration 📈

### Scale Up (Vertical)

```bash
# Upgrade to P1v3 tier
az appservice plan update \
  -g <RESOURCE_GROUP> \
  -n <APP_PLAN> \
  --sku P1v3
```

### Scale Out (Horizontal)

```bash
# Add more instances
az appservice plan update \
  -g <RESOURCE_GROUP> \
  -n <APP_PLAN> \
  --number-of-workers 3
```

### Auto-scaling

```bash
# Create autoscale rule
az monitor autoscale create \
  -g <RESOURCE_GROUP> \
  --resource <APP_PLAN_ID> \
  --min-count 1 \
  --max-count 10 \
  --count 2
```

---

## Cost Optimization 💰

### Development/Staging

- Use B1 tier (Basic)
- SQLite database
- Single instance

### Production

- Use P1v3 tier (Premium)
- Azure Database for PostgreSQL
- Auto-scaling enabled
- Azure CDN for static assets

### Estimated Monthly Costs

| Component | Dev | Production |
|-----------|-----|------------|
| App Service (B1) | $13 | - |
| App Service (P1v3) | - | $78 |
| PostgreSQL | - | $20-40 |
| Container Registry | $5 | $5 |
| **Total** | **$18** | **$103-123** |

---

## Cleanup Resources 🧹

### Using GitHub Actions

Run the **"Azure Destroy Resources"** workflow and type `DESTROY` to confirm.

### Using Azure CLI

```bash
# Delete entire resource group
az group delete -n <RESOURCE_GROUP> --yes --no-wait
```

### Selective Cleanup

```bash
# Delete only web apps
az webapp delete -g <RESOURCE_GROUP> -n <WEBAPP_FRONTEND>
az webapp delete -g <RESOURCE_GROUP> -n <WEBAPP_API>
az webapp delete -g <RESOURCE_GROUP> -n <WEBAPP_AUTH>
```

---

## Next Steps 🎯

After deployment:

1. ✅ Configure custom domain and SSL
2. ✅ Set up Azure Monitor and Application Insights
3. ✅ Configure backup policies
4. ✅ Set up Azure Front Door or CDN
5. ✅ Implement CI/CD pipeline
6. ✅ Configure authentication providers
7. ✅ Set up database backups

---

## Support and Documentation 📚

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [ASP.NET Core Deployment](https://docs.microsoft.com/aspnet/core/host-and-deploy/azure-apps/)

---

## Security Best Practices 🔒

1. ✅ Use managed identities (no credentials in code)
2. ✅ Store secrets in Azure Key Vault
3. ✅ Enable HTTPS only
4. ✅ Configure CORS properly
5. ✅ Use Azure AD for authentication
6. ✅ Enable diagnostic logging
7. ✅ Regular security updates
8. ✅ Implement rate limiting

---

**Your application is now ready to deploy to Azure!** 🚀

Choose your deployment method and follow the steps above. For automated CI/CD, GitHub Actions is recommended.