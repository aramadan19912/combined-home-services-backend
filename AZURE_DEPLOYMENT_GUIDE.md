# Azure Deployment Guide

This project deploys three containers to Azure App Service for Containers:
- API (`backend` Dockerfile) on port 8080
- Auth Server (`backend/AuthServer.Dockerfile`) on port 8081
- Frontend (`frontend` Dockerfile, Nginx) on port 8080

## 1) Provision Azure resources
Prerequisites: Azure CLI logged in and subscription selected.

```bash
chmod +x infra/azure/provision.sh
./infra/azure/provision.sh
```
This creates:
- Resource Group, ACR, Linux App Service Plan
- 3 Web Apps with managed identities and ACR pull permissions

Capture outputs printed by the script: `RESOURCE_GROUP`, `ACR_NAME`, `ACR_LOGIN_SERVER`, `WEBAPP_API`, `WEBAPP_AUTH`, `WEBAPP_FRONTEND`.

## 2) Configure GitHub secrets
Add these repository secrets:
- `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `AZURE_CLIENT_ID` (for OIDC login)
- `AZ_RESOURCE_GROUP`, `AZ_ACR_NAME`, `AZ_ACR_LOGIN_SERVER`
- `AZ_WEBAPP_API`, `AZ_WEBAPP_AUTH`, `AZ_WEBAPP_FRONTEND`
- `AZ_ACR_USERNAME`, `AZ_ACR_PASSWORD` (ACR admin disabled by default; create a token or enable admin temporarily)
- `PG_CONN_STR`, `APP_CORS_ORIGINS`, `AUTH_SELF_URL`, `AUTH_CLIENT_URL`, `AUTH_CORS_ORIGINS`

Notes:
- `AUTH_SELF_URL` should be your Auth Web App URL (e.g., `https://<WEBAPP_AUTH>.azurewebsites.net`).
- `AUTH_CLIENT_URL` is the frontend public URL.

## 3) Run the workflow
GitHub Actions workflow: `.github/workflows/azure-deploy.yml`.
- Triggers on pushes to `main` or manual dispatch.
- Builds and pushes images to ACR, then deploys to the three Web Apps.

## 4) App settings and ports
- API listens on `8080`, Auth on `8081`, Frontend on `8080`.
- The workflow sets `WEBSITES_PORT` accordingly and core env vars.

## 5) DNS and HTTPS
- Each Web App has a `*.azurewebsites.net` hostname by default with HTTPS.
- Map custom domains in Azure Portal and add DNS records as needed.

## 6) Database
- Uses PostgreSQL when `Database__Provider=PostgreSql` and `ConnectionStrings__Default` is provided.
- The API container runs migrations on start via `entrypoint.sh`.

## 7) Troubleshooting
- Check container logs: `az webapp log tail -g <RG> -n <APPNAME>`.
- Verify container port matches `WEBSITES_PORT`.
- Ensure the Web Apps managed identity has `AcrPull` role on the ACR.