# Azure Deployment Guide

This project deploys three containers to Azure App Service for Containers:
- API (`backend` Dockerfile) on port 8080
- Auth Server (`backend/AuthServer.Dockerfile`) on port 8081
- Frontend (`frontend` Dockerfile, Nginx) on port 8080

## 1) Provision Azure resources
Prerequisites: Azure login and subscription set. You can use the provided workflow.

Option A: Run via GitHub Actions
- Use `Azure Provision` workflow in `.github/workflows/azure-provision.yml` (requires OIDC secrets below)

Option B: Run locally
```bash
chmod +x infra/azure/provision.sh
./infra/azure/provision.sh
```
This creates RG, ACR, App Service plan, and 3 Web Apps with managed identities.

Record outputs: `RESOURCE_GROUP`, `ACR_NAME`, `ACR_LOGIN_SERVER`, `WEBAPP_API`, `WEBAPP_AUTH`, `WEBAPP_FRONTEND`.

## 2) Configure GitHub secrets (OIDC)
- `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CLIENT_ID`
- `AZ_RESOURCE_GROUP`, `AZ_ACR_NAME`, `AZ_ACR_LOGIN_SERVER`
- `AZ_WEBAPP_API`, `AZ_WEBAPP_AUTH`, `AZ_WEBAPP_FRONTEND`
- App settings: `PG_CONN_STR`, `APP_CORS_ORIGINS`, `AUTH_SELF_URL`, `AUTH_CLIENT_URL`, `AUTH_CORS_ORIGINS`

The deploy workflow logs into ACR using Azure OIDC (`az acr login -n $ACR_NAME`). No ACR username/password needed if the OIDC app has AcrPush on the ACR.

## 3) Run the deploy workflow
GitHub Actions → “Azure Deploy (API, Auth, Frontend)”.
- Builds/pushes images to ACR
- Deploys to the three Web Apps
- Sets app settings and binds images using managed identity

## 4) Ports and health
- API: 8080, Auth: 8081, Frontend: 8080
- Frontend exposes `/health`

## 5) DNS and HTTPS
- Default `*.azurewebsites.net` with HTTPS
- Add custom domains in portal as needed

## 6) Database
- Set `Database__Provider=PostgreSql` and `ConnectionStrings__Default` to your PG connection string
- API runs migrations on startup

## 7) Troubleshooting
- Logs: `az webapp log tail -g <RG> -n <APP>`
- Ensure `WEBSITES_PORT` matches container port
- Ensure Web Apps identities have `AcrPull` on ACR; OIDC app has `AcrPush`