# ✅ Azure Deployment Checklist

Use this checklist to ensure a smooth deployment to Azure.

## 📋 Pre-Deployment

### Local Environment Setup
- [ ] Azure CLI installed (`az --version`)
- [ ] Docker installed and running (`docker --version`)
- [ ] Git configured (for GitHub Actions)
- [ ] Code committed to repository
- [ ] All tests passing locally

### Azure Account Setup
- [ ] Azure account created
- [ ] Active subscription available
- [ ] Logged into Azure (`az login`)
- [ ] Correct subscription selected (`az account show`)

### GitHub Setup (for CI/CD)
- [ ] Repository created
- [ ] Code pushed to GitHub
- [ ] GitHub Actions enabled

## 🔐 Azure OIDC Setup (for GitHub Actions)

Only needed if using GitHub Actions deployment:

- [ ] Azure AD application created
- [ ] Service principal created
- [ ] Federated credentials configured for GitHub
- [ ] Contributor role assigned
- [ ] GitHub secrets configured:
  - [ ] `AZURE_CLIENT_ID`
  - [ ] `AZURE_TENANT_ID`
  - [ ] `AZURE_SUBSCRIPTION_ID`

## 🏗️ Infrastructure Provisioning

### Choose Deployment Method

**Option A: Quick Deploy Script**
- [ ] Script made executable (`chmod +x quick-deploy-azure.sh`)
- [ ] Run script (`./quick-deploy-azure.sh`)

**Option B: GitHub Actions**
- [ ] Run "Azure Provision" workflow
- [ ] Save outputs as GitHub secrets

**Option C: Manual/Bicep**
- [ ] Run provision script
- [ ] Note all output values

### After Provisioning
- [ ] Resource group created
- [ ] Container registry created
- [ ] App service plan created
- [ ] Three web apps created (API, Auth, Frontend)
- [ ] Managed identities assigned
- [ ] ACR pull permissions granted
- [ ] All resource names recorded

### Required Values Recorded
- [ ] `RESOURCE_GROUP`
- [ ] `ACR_NAME`
- [ ] `ACR_LOGIN_SERVER`
- [ ] `WEBAPP_API`
- [ ] `WEBAPP_AUTH`
- [ ] `WEBAPP_FRONTEND`

## 🗄️ Database Configuration

### SQLite (Default - Development)
- [ ] No additional configuration needed
- [ ] Understand limitations (single instance, non-persistent in free tier)

### PostgreSQL (Production)
- [ ] Azure PostgreSQL server created
- [ ] Database created
- [ ] Firewall rules configured
- [ ] Connection string obtained
- [ ] GitHub secret `PG_CONN_STR` set
- [ ] GitHub secret `DATABASE_PROVIDER=PostgreSql` set

## 🐳 Container Build & Deploy

### Manual Deployment
- [ ] Logged into ACR (`az acr login`)
- [ ] API image built
- [ ] API image pushed
- [ ] Auth Server image built
- [ ] Auth Server image pushed
- [ ] Frontend image built
- [ ] Frontend image pushed
- [ ] All apps restarted

### GitHub Actions Deployment
- [ ] AcrPush role granted to service principal
- [ ] Workflow triggered (push to main or manual)
- [ ] Workflow completed successfully
- [ ] All images built and pushed
- [ ] All apps deployed and restarted

## ⚙️ Configuration

### API Configuration
- [ ] `WEBSITES_PORT=8080` set
- [ ] Database provider configured
- [ ] Connection string set
- [ ] CORS origins configured
- [ ] Self URL set
- [ ] Auth server authority set

### Auth Server Configuration
- [ ] `WEBSITES_PORT=8081` set
- [ ] Database provider configured
- [ ] Connection string set
- [ ] CORS origins configured
- [ ] Self URL set
- [ ] Client URL set
- [ ] Redirect URLs configured

### Frontend Configuration
- [ ] `WEBSITES_PORT=8080` set
- [ ] API base URL set
- [ ] API host URL set
- [ ] Environment set to production

## 🧪 Testing & Verification

### Health Checks
- [ ] Frontend health check responds: `curl https://FRONTEND_URL/health`
- [ ] API health check responds: `curl https://API_URL/health`
- [ ] Auth Server health check responds: `curl https://AUTH_URL/health`

### Functional Testing
- [ ] Frontend loads in browser
- [ ] Can navigate between pages
- [ ] API endpoints responding
- [ ] Authentication works
- [ ] Database migrations completed
- [ ] File uploads working (if applicable)

### Log Verification
- [ ] No errors in frontend logs
- [ ] No errors in API logs
- [ ] No errors in auth server logs
- [ ] Application Insights configured (optional)

## 🔒 Security Configuration

### SSL/HTTPS
- [ ] HTTPS enforced on all apps
- [ ] TLS 1.2 minimum configured
- [ ] SSL certificates valid

### Access Control
- [ ] Managed identities configured
- [ ] ACR pull permissions set
- [ ] FTPS disabled
- [ ] No plain-text secrets in code

### CORS & Security Headers
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] CSP policy configured
- [ ] X-Frame-Options set

## 📊 Monitoring & Logging

- [ ] Diagnostic logging enabled
- [ ] Log streaming tested
- [ ] Application Insights configured (recommended)
- [ ] Alerts configured (recommended)
- [ ] Health check monitoring set up

## 🚀 Performance & Scaling

### Performance
- [ ] Appropriate SKU selected for workload
- [ ] Always-on enabled (for production)
- [ ] HTTP/2 enabled
- [ ] Gzip compression configured (frontend)

### Scaling (Production)
- [ ] Auto-scale rules configured (optional)
- [ ] Instance count set appropriately
- [ ] Resource limits understood

## 💰 Cost Optimization

- [ ] Correct SKU for environment (B1 for dev, P1v3 for prod)
- [ ] Unused resources deleted
- [ ] Cost alerts configured
- [ ] Resource tags applied for cost tracking

## 📝 Documentation

- [ ] Deployment documented
- [ ] URLs recorded
- [ ] Credentials stored securely (if any)
- [ ] Team members notified
- [ ] Runbook created/updated
- [ ] Architecture diagram updated (if applicable)

## 🔄 CI/CD Pipeline (GitHub Actions)

- [ ] All GitHub secrets configured
- [ ] Workflows tested
- [ ] Deployment history reviewed
- [ ] Rollback procedure documented
- [ ] Branch protection rules set (recommended)

## 🎯 Post-Deployment Tasks

### Immediate
- [ ] Verify all functionality
- [ ] Check all health endpoints
- [ ] Review logs for errors
- [ ] Test user workflows
- [ ] Monitor performance

### Short-term (Within 1 week)
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL for custom domain
- [ ] Configure Azure Front Door/CDN (if needed)
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Load testing completed

### Long-term (Within 1 month)
- [ ] Application Insights fully configured
- [ ] Azure AD authentication integrated (if needed)
- [ ] Backup and restore tested
- [ ] Disaster recovery plan documented
- [ ] Performance baseline established
- [ ] Security audit completed

## 🆘 Troubleshooting Preparation

- [ ] Know how to view logs (`az webapp log tail`)
- [ ] Know how to restart apps (`az webapp restart`)
- [ ] Rollback procedure documented
- [ ] Support contacts documented
- [ ] Incident response plan ready

## ✨ Optional Enhancements

- [ ] Azure Key Vault for secrets
- [ ] Azure Front Door for global distribution
- [ ] Azure CDN for static assets
- [ ] Azure AD B2C for user management
- [ ] Azure API Management
- [ ] Azure Monitor dashboards
- [ ] Azure DevOps integration
- [ ] Blue-Green deployment strategy
- [ ] Canary releases

## 📞 Support Resources

- [ ] Azure support plan reviewed
- [ ] Documentation bookmarked
- [ ] Team trained on deployment
- [ ] Escalation path defined
- [ ] Vendor contacts documented

---

## Quick Command Reference

### View Logs
```bash
az webapp log tail -g hsapp-rg -n hsapp-frontend-XXXXX
```

### Restart App
```bash
az webapp restart -g hsapp-rg -n hsapp-api-XXXXX
```

### Update Setting
```bash
az webapp config appsettings set -g hsapp-rg -n hsapp-api-XXXXX --settings KEY=VALUE
```

### Check Health
```bash
curl https://hsapp-frontend-XXXXX.azurewebsites.net/health
```

---

## Sign-off

**Deployment completed by:** ___________________________

**Date:** ___________________________

**Environment:** [ ] Development  [ ] Staging  [ ] Production

**Issues encountered:** ___________________________

**Notes:** ___________________________

---

**Congratulations on your deployment! 🎉**

Keep this checklist for future deployments and reference.