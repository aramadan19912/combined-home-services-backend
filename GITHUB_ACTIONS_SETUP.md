# 🔧 GitHub Actions Setup - Troubleshooting Guide

## ❌ Error: "Registry names may contain only alpha numeric characters"

This error occurs when the `ACR_NAME` GitHub secret is not set or is empty.

## 🛠️ How to Fix

### Step 1: Provision Azure Infrastructure First

Before running the deployment workflow, you **must** provision the Azure infrastructure:

#### Option A: Use GitHub Actions (Recommended)

1. Go to your GitHub repository
2. Click **Actions** tab
3. Find **"Azure Provision"** workflow
4. Click **"Run workflow"**
5. Fill in the parameters:
   - Location: `eastus` (or your preferred region)
   - Resource Group: `hsapp-rg` (or custom name)
6. Click **"Run workflow"**

The workflow will output resource names that you need to save as secrets.

#### Option B: Run Locally

```bash
# Login to Azure
az login

# Run the provision script
chmod +x infra/azure/provision.sh
./infra/azure/provision.sh

# Note the output values
```

### Step 2: Add GitHub Secrets

After provisioning, you'll get these values. Add them as **GitHub Secrets**:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each of these secrets:

#### Required Infrastructure Secrets

```
RESOURCE_GROUP=hsapp-rg
ACR_NAME=hsappacr12345
ACR_LOGIN_SERVER=hsappacr12345.azurecr.io
WEBAPP_API=hsapp-api-12345
WEBAPP_AUTH=hsapp-auth-12345
WEBAPP_FRONTEND=hsapp-frontend-12345
```

#### Required Azure OIDC Secrets

```
AZURE_CLIENT_ID=<your-azure-ad-app-id>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_SUBSCRIPTION_ID=<your-subscription-id>
```

### Step 3: Grant ACR Push Permission

The GitHub Actions service principal needs permission to push images:

```bash
# Get your service principal's client ID (from GitHub secret AZURE_CLIENT_ID)
CLIENT_ID="<your-azure-client-id>"

# Get the ACR resource ID
ACR_ID=$(az acr show --name <your-acr-name> --query id -o tsv)

# Grant AcrPush role
az role assignment create \
  --assignee $CLIENT_ID \
  --role AcrPush \
  --scope $ACR_ID
```

### Step 4: Run Deployment

Now you can run the deployment workflow:

1. Go to **Actions** tab
2. Find **"Azure Deploy (API, Auth, Frontend)"** workflow
3. Click **"Run workflow"**
4. Or push to `main` branch

## 📋 Secrets Checklist

Make sure you have ALL these GitHub secrets configured:

### Azure Authentication (Required)
- [ ] `AZURE_CLIENT_ID`
- [ ] `AZURE_TENANT_ID`
- [ ] `AZURE_SUBSCRIPTION_ID`

### Azure Resources (Required - from provision output)
- [ ] `RESOURCE_GROUP`
- [ ] `ACR_NAME`
- [ ] `ACR_LOGIN_SERVER`
- [ ] `WEBAPP_API`
- [ ] `WEBAPP_AUTH`
- [ ] `WEBAPP_FRONTEND`

### Optional Configuration
- [ ] `DATABASE_PROVIDER` (default: Sqlite)
- [ ] `PG_CONN_STR` (if using PostgreSQL)
- [ ] `APP_CORS_ORIGINS` (auto-configured if not set)

## 🔍 Verify Secrets

To verify your secrets are set correctly:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all the secrets listed
3. Click the **Update** button to verify they're not empty

## 🚀 Complete Setup Flow

```
1. Set up Azure AD App with OIDC
   ↓
2. Add AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID secrets
   ↓
3. Run "Azure Provision" workflow
   ↓
4. Add infrastructure secrets from provision output
   ↓
5. Grant AcrPush permission to service principal
   ↓
6. Run "Azure Deploy" workflow ✅
```

## 📚 Detailed Instructions

For complete setup instructions, see:
- **[AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md)** - Full guide
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Deployment overview

## 🆘 Still Having Issues?

### Check if secrets are actually set:

```bash
# In your GitHub Actions workflow, add a debug step:
- name: Debug Secrets
  run: |
    echo "ACR_NAME length: ${#ACR_NAME}"
    echo "ACR_NAME first char: ${ACR_NAME:0:1}"
    # Don't print the actual value for security
```

### Common Issues:

1. **Secret is empty**: Run provision workflow first
2. **Secret has spaces**: Ensure no trailing spaces when copying
3. **Wrong secret name**: Check for typos (case-sensitive)
4. **Service principal lacks permission**: Grant AcrPush role

### Alternative: Use Legacy Secret Names

If you have secrets with `AZ_` prefix, they will work too:
- `AZ_RESOURCE_GROUP` instead of `RESOURCE_GROUP`
- `AZ_ACR_NAME` instead of `ACR_NAME`
- etc.

## ✅ Quick Fix Commands

```bash
# 1. Provision infrastructure
az login
./infra/azure/provision.sh

# 2. Note the output values and add them to GitHub secrets manually

# 3. Grant ACR push permission
az role assignment create \
  --assignee <AZURE_CLIENT_ID> \
  --role AcrPush \
  --scope $(az acr show -n <ACR_NAME> --query id -o tsv)

# 4. Trigger deployment
git push origin main
```

---

**Remember**: You must provision infrastructure **before** deploying the application!