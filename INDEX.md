# 📑 Home Services App - Documentation Index

## 🎯 Quick Navigation

**Just want to deploy?** → Start here: **[GETTING_STARTED.md](GETTING_STARTED.md)**

**First time with Azure?** → Read: **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)**

**Need a command?** → Check: **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**

---

## 📚 Complete Documentation Map

### 🚀 Getting Started (Start Here!)

| Document | For Who | Time to Read | Purpose |
|----------|---------|--------------|---------|
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Everyone | 5 min | Quick start guide to deploy to Azure |
| **[README.md](README.md)** | Everyone | 10 min | Project overview and features |

### 📋 Deployment Guides

| Document | For Who | Time to Read | Purpose |
|----------|---------|--------------|---------|
| **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** | Developers, DevOps | 15 min | Complete overview of all deployment options |
| **[AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md)** | DevOps, Production | 30 min | Comprehensive Azure deployment guide |
| **[AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md)** | Developers | 10 min | Quick reference guide (original) |
| **[frontend/DEPLOYMENT_GUIDE.md](frontend/DEPLOYMENT_GUIDE.md)** | Frontend devs | 20 min | Frontend deployment options |

### ⚡ Quick References

| Document | For Who | Time to Read | Purpose |
|----------|---------|--------------|---------|
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Everyone | 5 min | Command cheat sheet |
| **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** | Team leads, QA | 10 min | Step-by-step deployment checklist |
| **[AZURE_DEPLOYMENT_COMPLETE.md](AZURE_DEPLOYMENT_COMPLETE.md)** | Everyone | 10 min | Summary of what's been created |

### 🏗️ Architecture & Technical

| Document | For Who | Time to Read | Purpose |
|----------|---------|--------------|---------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architects, Leads | 20 min | System architecture diagrams |
| **[frontend/API_INTEGRATION_COMPLETE.md](frontend/API_INTEGRATION_COMPLETE.md)** | Developers | 15 min | API integration details |
| **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** | Developers | 10 min | Integration status |

---

## 🛠️ Deployment Scripts & Tools

### Interactive Deployment

```bash
# ⭐ Recommended for first-time deployment
./quick-deploy-azure.sh
```

**File**: `quick-deploy-azure.sh`  
**Purpose**: One-command interactive deployment with guided setup  
**Best for**: First-time users, testing, manual deployments

### Automated Deployment

```bash
# Full deployment automation
./deploy-azure.sh
```

**File**: `deploy-azure.sh`  
**Purpose**: Complete deployment with minimal interaction  
**Best for**: Regular deployments, scripted automation

### Infrastructure Only

```bash
# Provision Azure resources only
./infra/azure/provision.sh

# Using Bicep IaC
./infra/azure/deploy-bicep.sh
```

**Files**: `infra/azure/provision.sh`, `infra/azure/deploy-bicep.sh`  
**Purpose**: Set up Azure infrastructure  
**Best for**: Initial setup, infrastructure management

### Local Testing

```bash
# Test locally before deploying
docker-compose up --build
```

**File**: `docker-compose.yml`  
**Purpose**: Run entire stack locally  
**Best for**: Development, testing, debugging

---

## 🤖 GitHub Actions Workflows

Located in `.github/workflows/`

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **azure-provision.yml** | Manual | Provision Azure infrastructure |
| **azure-provision-bicep.yml** | Manual | Provision using Bicep template |
| **azure-deploy.yml** | Push to main / Manual | Deploy application to Azure |
| **azure-destroy.yml** | Manual | Clean up Azure resources |
| **backend-ci.yml** | Push | Backend CI/CD (existing) |

### How to Use

1. **First Time**: Run `azure-provision.yml` to create infrastructure
2. **Deployment**: Push to `main` branch (automatic) or trigger `azure-deploy.yml`
3. **Cleanup**: Run `azure-destroy.yml` when done

---

## 📁 Infrastructure Files

### Bicep Templates

| File | Purpose |
|------|---------|
| `infra/azure/main.bicep` | Complete Azure infrastructure definition |

### Docker Configuration

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | API server container |
| `backend/AuthServer.Dockerfile` | Auth server container |
| `frontend/Dockerfile` | Frontend container with Nginx |
| `frontend/nginx.conf` | Nginx configuration for frontend |
| `docker-compose.yml` | Local development stack |

### Configuration Templates

| File | Purpose |
|------|---------|
| `.env.azure.example` | Azure environment variables template |

---

## 🎓 Learning Paths

### Path 1: Quick Deploy (30 minutes)
1. Read [GETTING_STARTED.md](GETTING_STARTED.md) (5 min)
2. Run `quick-deploy-azure.sh` (15 min)
3. Verify deployment (5 min)
4. Bookmark [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (5 min)

### Path 2: Production Setup (2-3 hours)
1. Read [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) (15 min)
2. Read [AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md) (30 min)
3. Set up Azure OIDC (30 min)
4. Configure GitHub Actions (30 min)
5. Deploy and test (30 min)
6. Review [ARCHITECTURE.md](ARCHITECTURE.md) (20 min)

### Path 3: Deep Dive (4-5 hours)
1. Complete Path 2
2. Study [ARCHITECTURE.md](ARCHITECTURE.md) (30 min)
3. Review Bicep template `infra/azure/main.bicep` (30 min)
4. Test all deployment methods (1 hour)
5. Configure monitoring and alerts (1 hour)
6. Set up custom domain (30 min)
7. Configure PostgreSQL (30 min)

---

## 🔍 Find What You Need

### I want to...

**Deploy for the first time**
→ [GETTING_STARTED.md](GETTING_STARTED.md)

**Understand deployment options**
→ [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)

**Set up CI/CD with GitHub Actions**
→ [AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md)

**Find a specific command**
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**Follow a checklist**
→ [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**Understand the architecture**
→ [ARCHITECTURE.md](ARCHITECTURE.md)

**Troubleshoot an issue**
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md#troubleshooting)

**Test locally**
→ Run `docker-compose up`

**Deploy manually**
→ Run `./quick-deploy-azure.sh`

**Automate deployment**
→ Set up workflows in [AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md)

**Clean up resources**
→ Run workflow `azure-destroy.yml` or `az group delete`

---

## 💡 Tips & Best Practices

### For First-Time Users
- Start with `quick-deploy-azure.sh`
- Use B1 tier for testing
- Test locally with `docker-compose` first
- Keep `QUICK_REFERENCE.md` handy

### For Production
- Use GitHub Actions for CI/CD
- Choose P1v3 or higher tier
- Use PostgreSQL instead of SQLite
- Set up Application Insights
- Configure auto-scaling
- Use custom domain with SSL

### For Teams
- Follow `DEPLOYMENT_CHECKLIST.md`
- Document your specific configuration
- Use staging environment
- Set up monitoring alerts
- Regular backup strategy

---

## 📊 File Statistics

| Category | Count | Files |
|----------|-------|-------|
| **Documentation** | 13 | README, guides, references |
| **Deployment Scripts** | 4 | Shell scripts for deployment |
| **GitHub Workflows** | 5 | CI/CD automation |
| **Infrastructure** | 2 | Bicep templates |
| **Docker Config** | 5 | Dockerfiles, compose, nginx |
| **Configuration** | 1 | Environment templates |
| **Total** | **30** | **Complete deployment solution** |

---

## 🚀 Quick Commands

```bash
# Deploy to Azure
./quick-deploy-azure.sh

# Test locally
docker-compose up --build

# View logs
az webapp log tail -g hsapp-rg -n your-app

# Check health
curl https://your-app.azurewebsites.net/health

# Restart app
az webapp restart -g hsapp-rg -n your-app

# Clean up
az group delete -n hsapp-rg --yes
```

---

## 🎯 Success Criteria

After deployment, you should have:

- [ ] Three web apps running on Azure
- [ ] Container registry with your images
- [ ] HTTPS enabled on all endpoints
- [ ] Health checks passing
- [ ] Application accessible via browser
- [ ] Logs viewable via Azure CLI
- [ ] CI/CD pipeline configured (optional)
- [ ] Documentation reviewed

---

## 📞 Support & Resources

### Documentation
- Main docs are in this repository
- Azure docs: https://docs.microsoft.com/azure
- GitHub Actions: https://docs.github.com/actions

### Tools
- Azure CLI: https://aka.ms/InstallAzureCLIDeb
- Docker: https://docs.docker.com/get-docker/
- Git: https://git-scm.com/downloads

### Getting Help
1. Check documentation (start with GETTING_STARTED.md)
2. Review troubleshooting in QUICK_REFERENCE.md
3. Check Azure Portal logs
4. Use `az webapp log tail` for live logs

---

## ✅ Completion Checklist

Before you start:
- [ ] Read INDEX.md (this file)
- [ ] Read GETTING_STARTED.md
- [ ] Verify prerequisites

For deployment:
- [ ] Choose deployment method
- [ ] Follow relevant guide
- [ ] Use DEPLOYMENT_CHECKLIST.md
- [ ] Test deployment
- [ ] Bookmark QUICK_REFERENCE.md

After deployment:
- [ ] Verify all services
- [ ] Configure monitoring
- [ ] Document your setup
- [ ] Train team members

---

## 🎉 You're All Set!

This index provides a complete map of all available documentation and tools.

**Start here:** [GETTING_STARTED.md](GETTING_STARTED.md)

**Questions?** Check the relevant guide above.

**Ready to deploy?**

```bash
chmod +x quick-deploy-azure.sh && ./quick-deploy-azure.sh
```

Happy deploying! 🚀