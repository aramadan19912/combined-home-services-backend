# 🚀 Getting Started - Home Services App on Azure

Welcome! This guide will help you deploy the Home Services application to Microsoft Azure in the fastest way possible.

## ⚡ Quick Start (5 Minutes)

### Step 1: Prerequisites

Install these tools:

```bash
# Install Azure CLI (Linux/WSL)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify installations
az --version
docker --version
```

### Step 2: Login to Azure

```bash
az login
```

### Step 3: Deploy!

```bash
# Clone the repository (if not already done)
# cd to project root

# Run the quick deploy script
chmod +x quick-deploy-azure.sh
./quick-deploy-azure.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Verify Azure login
- ✅ Ask for configuration (region, SKU, etc.)
- ✅ Provision Azure infrastructure
- ✅ Build and push Docker images
- ✅ Deploy all services
- ✅ Open your app in the browser

## 📖 Detailed Guides

Choose the guide that matches your needs:

### For First-Time Users
👉 **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Complete overview of deployment options

### For Production Deployments
👉 **[AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md)** - Comprehensive setup guide with GitHub Actions

### For Quick Reference
👉 **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands and troubleshooting

### For Checking Progress
👉 **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist

### For Understanding Architecture
👉 **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams

## 🎯 What Gets Deployed

After deployment, you'll have:

```
┌─────────────────────────────────────────┐
│     Azure Resource Group: hsapp-rg      │
│                                         │
│  ✅ Container Registry (ACR)            │
│     - Stores your Docker images         │
│                                         │
│  ✅ App Service Plan                    │
│     - Linux, B1 or P1v3 tier           │
│                                         │
│  ✅ Frontend Web App                    │
│     - React + TypeScript + Vite        │
│     - https://hsapp-frontend-XXX...    │
│                                         │
│  ✅ API Web App                         │
│     - ASP.NET Core 9.0                 │
│     - https://hsapp-api-XXX...         │
│                                         │
│  ✅ Auth Server Web App                 │
│     - OpenIddict + ASP.NET Core        │
│     - https://hsapp-auth-XXX...        │
│                                         │
│  ✅ Database                            │
│     - SQLite (dev) or PostgreSQL (prod)│
└─────────────────────────────────────────┘
```

## 💰 Costs

| Environment | Monthly Cost | Use Case |
|-------------|--------------|----------|
| Development | ~$18 | Testing, demos |
| Staging | ~$35 | Pre-production |
| Production | ~$103-123 | Live application |

All prices include all three web apps + container registry.

## 🔄 Deployment Methods Comparison

| Method | Best For | Setup Time | Automation |
|--------|----------|------------|------------|
| **Quick Deploy Script** | First deployment, testing | 5-10 min | Semi-automated |
| **GitHub Actions** | Production, CI/CD | 30 min setup | Fully automated |
| **Manual/Bicep** | Custom configs, enterprise | 15-20 min | Manual control |
| **Deploy Script** | Regular deployments | 10-15 min | Semi-automated |

## 📁 Important Files

### Deployment Scripts
- `quick-deploy-azure.sh` - Interactive one-command deployment ⭐
- `deploy-azure.sh` - Full automation script
- `infra/azure/provision.sh` - Infrastructure provisioning
- `docker-compose.yml` - Local testing

### GitHub Actions Workflows
- `.github/workflows/azure-provision.yml` - Provision infrastructure
- `.github/workflows/azure-deploy.yml` - Deploy application
- `.github/workflows/azure-destroy.yml` - Clean up resources

### Infrastructure as Code
- `infra/azure/main.bicep` - Bicep template
- `infra/azure/deploy-bicep.sh` - Deploy with Bicep

### Documentation
- `DEPLOYMENT_SUMMARY.md` - Complete deployment overview
- `AZURE_SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `QUICK_REFERENCE.md` - Command reference
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `ARCHITECTURE.md` - Architecture diagrams

### Configuration
- `.env.azure.example` - Environment variables template

## 🎓 Learning Path

### 1️⃣ Beginner Path
1. Read this guide (you're here!)
2. Run `quick-deploy-azure.sh`
3. Explore your deployed app
4. Check `QUICK_REFERENCE.md` for common tasks

### 2️⃣ Intermediate Path
1. Read `DEPLOYMENT_SUMMARY.md`
2. Choose deployment method
3. Follow `DEPLOYMENT_CHECKLIST.md`
4. Set up monitoring

### 3️⃣ Advanced Path
1. Read `AZURE_SETUP_INSTRUCTIONS.md`
2. Set up GitHub Actions CI/CD
3. Configure custom domain
4. Set up PostgreSQL database
5. Configure Application Insights
6. Study `ARCHITECTURE.md`

## 🧪 Test Locally First

Before deploying to Azure, test locally:

```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8080
# Auth: http://localhost:8081

# Stop services
docker-compose down
```

## 🆘 Need Help?

### Common Issues

**"Azure CLI not found"**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**"Docker not running"**
```bash
# Start Docker
sudo systemctl start docker
# Or Docker Desktop on Windows/Mac
```

**"Not logged into Azure"**
```bash
az login
```

**"Deployment failed"**
```bash
# Check logs
az webapp log tail -g hsapp-rg -n your-app-name

# Restart app
az webapp restart -g hsapp-rg -n your-app-name
```

### Get Support

1. Check `QUICK_REFERENCE.md` for common commands
2. Review `DEPLOYMENT_CHECKLIST.md` to ensure all steps completed
3. See troubleshooting section in `AZURE_SETUP_INSTRUCTIONS.md`
4. Check Azure Portal for error messages

## ✅ After Deployment

### Verify Everything Works

```bash
# Check health endpoints
curl https://your-frontend-app.azurewebsites.net/health
curl https://your-api-app.azurewebsites.net/health
curl https://your-auth-app.azurewebsites.net/health

# View logs
az webapp log tail -g hsapp-rg -n your-frontend-app

# Open in browser
az webapp browse -g hsapp-rg -n your-frontend-app
```

### Next Steps

- [ ] Test all functionality
- [ ] Configure custom domain (optional)
- [ ] Set up SSL for custom domain (optional)
- [ ] Configure monitoring alerts
- [ ] Set up database backups (if using PostgreSQL)
- [ ] Configure auto-scaling (for production)
- [ ] Set up Application Insights
- [ ] Document your deployment

## 🔄 Updating Your Deployment

### Quick Update

```bash
# If using GitHub Actions
git push origin main  # Automatic deployment

# If using scripts
./deploy-azure.sh  # Rebuild and redeploy
```

### Manual Update

```bash
# Login to ACR
az acr login -n your-acr-name

# Rebuild and push images
docker build -f frontend/Dockerfile -t your-acr.azurecr.io/hsapp-frontend:latest frontend
docker push your-acr.azurecr.io/hsapp-frontend:latest

# Restart the app
az webapp restart -g hsapp-rg -n your-frontend-app
```

## 🧹 Cleanup

When you're done testing:

```bash
# Delete everything
az group delete -n hsapp-rg --yes --no-wait

# Or use GitHub Actions "Azure Destroy Resources" workflow
```

## 🎉 Success!

Once deployed, you'll have a fully functional home services marketplace running on Azure with:

- ✅ Automatic HTTPS/SSL
- ✅ Container-based deployment
- ✅ Managed infrastructure
- ✅ Health monitoring
- ✅ Easy scaling
- ✅ Professional architecture

**Ready to deploy? Run:**

```bash
chmod +x quick-deploy-azure.sh && ./quick-deploy-azure.sh
```

---

**Questions?** Check the documentation files listed above or review the architecture in `ARCHITECTURE.md`.

**Happy deploying! 🚀**