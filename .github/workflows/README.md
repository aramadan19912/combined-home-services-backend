# GitHub Actions Workflows

## ⚠️ Important: Setup Required Before First Run

Before running any deployment workflows, you **must**:

1. **Set up Azure OIDC credentials** (one-time)
2. **Provision Azure infrastructure** (run once)
3. **Configure GitHub secrets** (from provision output)

See [GITHUB_ACTIONS_SETUP.md](../../GITHUB_ACTIONS_SETUP.md) for detailed instructions.

## 📋 Workflows

### 1. Azure Provision
**File**: `azure-provision.yml`  
**Trigger**: Manual  
**Purpose**: Create Azure infrastructure (Resource Group, ACR, App Services)

**When to run**: 
- First time setup
- Creating a new environment

**Output**: Resource names to save as GitHub secrets

### 2. Azure Provision (Bicep)
**File**: `azure-provision-bicep.yml`  
**Trigger**: Manual  
**Purpose**: Same as above but using Bicep IaC

**When to run**: 
- If you prefer Infrastructure as Code approach
- Same as Azure Provision workflow

### 3. Azure Deploy
**File**: `azure-deploy.yml`  
**Trigger**: Push to `main` branch (automatic) or Manual  
**Purpose**: Build and deploy application to Azure

**When to run**: 
- After infrastructure is provisioned
- Every code update (automatic on push)

**Requirements**: All secrets must be configured

### 4. Azure Destroy
**File**: `azure-destroy.yml`  
**Trigger**: Manual (requires "DESTROY" confirmation)  
**Purpose**: Delete all Azure resources

**When to run**: 
- When you're done with the environment
- To clean up test resources

## 🔑 Required Secrets

### Azure Authentication (Required First)
```
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
```

### Infrastructure (From Provision Output)
```
RESOURCE_GROUP
ACR_NAME
ACR_LOGIN_SERVER
WEBAPP_API
WEBAPP_AUTH
WEBAPP_FRONTEND
```

## 🚀 Quick Start

### First Time Setup

1. **Set up Azure AD App**
   ```bash
   # Create app
   az ad app create --display-name "HomeServicesApp-GitHub"
   
   # Configure federated credentials for GitHub
   # See AZURE_SETUP_INSTRUCTIONS.md for details
   ```

2. **Add OIDC secrets to GitHub**
   - Go to Settings → Secrets and variables → Actions
   - Add: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`

3. **Run Provision workflow**
   - Actions → "Azure Provision" → Run workflow
   - Note the output values

4. **Add infrastructure secrets**
   - Add all values from provision output as GitHub secrets

5. **Grant ACR push permission**
   ```bash
   az role assignment create \
     --assignee <AZURE_CLIENT_ID> \
     --role AcrPush \
     --scope $(az acr show -n <ACR_NAME> --query id -o tsv)
   ```

6. **Deploy!**
   - Push to main branch (automatic)
   - Or trigger "Azure Deploy" workflow manually

## 🔧 Troubleshooting

### Error: "Registry names may contain only alpha numeric characters"
**Cause**: `ACR_NAME` secret is not set or empty  
**Fix**: Run provision workflow first, then add secrets

### Error: "unauthorized: authentication required"
**Cause**: Service principal lacks AcrPush permission  
**Fix**: Grant AcrPush role to your service principal

### Error: "OIDC token exchange failed"
**Cause**: Federated credentials not configured correctly  
**Fix**: Check Azure AD app federated credentials configuration

See [GITHUB_ACTIONS_SETUP.md](../../GITHUB_ACTIONS_SETUP.md) for detailed troubleshooting.

## 📚 Documentation

- [GITHUB_ACTIONS_SETUP.md](../../GITHUB_ACTIONS_SETUP.md) - Setup and troubleshooting
- [AZURE_SETUP_INSTRUCTIONS.md](../../AZURE_SETUP_INSTRUCTIONS.md) - Complete guide
- [DEPLOYMENT_SUMMARY.md](../../DEPLOYMENT_SUMMARY.md) - Deployment overview

## 🎯 Workflow Order

```
1st Run:
  Azure Provision → Add Secrets → Grant Permissions

Every Deployment:
  Push to main → Azure Deploy (automatic)
  OR
  Trigger Azure Deploy manually

Cleanup:
  Azure Destroy (when done)
```

## ✅ Checklist Before First Deployment

- [ ] Azure AD app created
- [ ] Federated credentials configured
- [ ] OIDC secrets added to GitHub
- [ ] Provision workflow completed successfully
- [ ] Infrastructure secrets added to GitHub
- [ ] AcrPush permission granted
- [ ] Ready to deploy! 🚀