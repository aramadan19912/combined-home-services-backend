# 🔴 Fix GitHub Actions Deployment Error

## ❌ Current Error

```
ERROR: Registry names may contain only alpha numeric characters and must be between 5 and 50 characters
Error: Process completed with exit code 1.
```

## 🎯 Root Cause

Your GitHub secrets for Azure resources are **not configured**. The `ACR_NAME` secret is empty or missing.

## ✅ Quick Fix (Step-by-Step)

### Step 1: Provision Azure Infrastructure

You **must** create the Azure resources first:

#### Option A: Using GitHub Actions (Easiest)

1. Go to your GitHub repo: https://github.com/aramadan19912/combined-home-services-backend
2. Click **"Actions"** tab
3. Find **"Azure Provision"** workflow in the left sidebar
4. Click **"Run workflow"** (top right)
5. Fill in:
   - **Location**: `eastus` (or your preferred region)
   - **Resource Group**: `hsapp-rg`
6. Click green **"Run workflow"** button
7. Wait for completion (2-3 minutes)
8. **Copy the output values** shown at the end

#### Option B: Using Local Script (If you prefer)

```bash
# Clone repo if not already done
cd combined-home-services-backend

# Login to Azure
az login

# Run provision script
chmod +x infra/azure/provision.sh
./infra/azure/provision.sh

# Copy the output values
```

### Step 2: Add GitHub Secrets

After provisioning completes, you'll get output like this:

```
RESOURCE_GROUP=hsapp-rg
ACR_NAME=hsappacr12345
ACR_LOGIN_SERVER=hsappacr12345.azurecr.io
WEBAPP_API=hsapp-api-12345
WEBAPP_AUTH=hsapp-auth-12345
WEBAPP_FRONTEND=hsapp-frontend-12345
```

**Add these as GitHub secrets:**

1. Go to: https://github.com/aramadan19912/combined-home-services-backend/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each value:

| Secret Name | Example Value | Where to Get It |
|-------------|---------------|-----------------|
| `RESOURCE_GROUP` | `hsapp-rg` | From provision output |
| `ACR_NAME` | `hsappacr12345` | From provision output |
| `ACR_LOGIN_SERVER` | `hsappacr12345.azurecr.io` | From provision output |
| `WEBAPP_API` | `hsapp-api-12345` | From provision output |
| `WEBAPP_AUTH` | `hsapp-auth-12345` | From provision output |
| `WEBAPP_FRONTEND` | `hsapp-frontend-12345` | From provision output |

### Step 3: Grant ACR Push Permission

Your GitHub Actions service principal needs permission to push Docker images:

```bash
# Replace <YOUR-AZURE-CLIENT-ID> with your actual client ID from secrets
# Replace <YOUR-ACR-NAME> with the actual ACR name from step 1

az role assignment create \
  --assignee <YOUR-AZURE-CLIENT-ID> \
  --role AcrPush \
  --scope $(az acr show -n <YOUR-ACR-NAME> --query id -o tsv)
```

For example:
```bash
az role assignment create \
  --assignee abc123-def4-5678-90ab-cdef12345678 \
  --role AcrPush \
  --scope $(az acr show -n hsappacr12345 --query id -o tsv)
```

### Step 4: Verify Secrets

Double-check your GitHub secrets are set:

1. Go to: https://github.com/aramadan19912/combined-home-services-backend/settings/secrets/actions
2. You should see **all 9 secrets**:
   - `AZURE_CLIENT_ID` ✓
   - `AZURE_TENANT_ID` ✓
   - `AZURE_SUBSCRIPTION_ID` ✓
   - `RESOURCE_GROUP` ✓
   - `ACR_NAME` ✓
   - `ACR_LOGIN_SERVER` ✓
   - `WEBAPP_API` ✓
   - `WEBAPP_AUTH` ✓
   - `WEBAPP_FRONTEND` ✓

### Step 5: Retry Deployment

Now run the deployment:

1. Go to **Actions** tab
2. Find **"Azure Deploy (API, Auth, Frontend)"** workflow
3. Click **"Run workflow"**
4. Or just push a commit to trigger automatic deployment

## 🔍 Verify It's Working

After deployment succeeds, check:

```bash
# Check frontend health
curl https://hsapp-frontend-XXXXX.azurewebsites.net/health

# Or open in browser
az webapp browse -g hsapp-rg -n hsapp-frontend-XXXXX
```

## 📋 Required Secrets Summary

### Already Configured (from your earlier setup)
- ✅ `AZURE_CLIENT_ID`
- ✅ `AZURE_TENANT_ID`
- ✅ `AZURE_SUBSCRIPTION_ID`

### Missing (need to add from provision output)
- ❌ `RESOURCE_GROUP`
- ❌ `ACR_NAME`
- ❌ `ACR_LOGIN_SERVER`
- ❌ `WEBAPP_API`
- ❌ `WEBAPP_AUTH`
- ❌ `WEBAPP_FRONTEND`

## 🎯 TL;DR - Quick Commands

```bash
# 1. Provision (choose one):
# Via GitHub Actions: Run "Azure Provision" workflow
# OR via CLI:
./infra/azure/provision.sh

# 2. Add the 6 output values as GitHub secrets

# 3. Grant ACR permission:
az role assignment create \
  --assignee <YOUR-AZURE-CLIENT-ID> \
  --role AcrPush \
  --scope $(az acr show -n <YOUR-ACR-NAME> --query id -o tsv)

# 4. Re-run deployment:
# Push to main or trigger "Azure Deploy" workflow
```

## 🆘 Still Stuck?

See detailed guides:
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - GitHub Actions troubleshooting
- [AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md) - Complete setup guide

---

**The key issue**: You tried to deploy without provisioning infrastructure first. Always provision → configure secrets → deploy!