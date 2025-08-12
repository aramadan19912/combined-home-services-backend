#!/usr/bin/env bash
set -euo pipefail

# This script provisions Azure resources for the HomeServices app.
# It creates: Resource Group, ACR, App Service Plan (Linux), and 3 Web Apps (API, Auth, Frontend)
# It also assigns managed identity to web apps and grants ACR pull permission.
#
# Prerequisites:
# - Azure CLI logged in: az login
# - Correct subscription selected: az account set -s <SUBSCRIPTION_ID>
#
# Usage (edit variables below or pass as env vars):
#   ./infra/azure/provision.sh

# -------- Config (override via env) --------
: "${LOCATION:=eastus}"
: "${RESOURCE_GROUP:=hsapp-rg}"
: "${ACR_NAME:=hsappacr$RANDOM}"   # must be globally unique
: "${APP_PLAN:=hsapp-asp}"

# Web app names must be globally unique within Azure
: "${WEBAPP_API:=hsapp-api-$RANDOM}"
: "${WEBAPP_AUTH:=hsapp-auth-$RANDOM}"
: "${WEBAPP_FRONTEND:=hsapp-frontend-$RANDOM}"

# Internal container ports (match Dockerfiles)
API_PORT=8080
AUTH_PORT=8081
FRONTEND_PORT=8080

# ------------------------------------------

echo "Creating resource group: $RESOURCE_GROUP in $LOCATION"
az group create -n "$RESOURCE_GROUP" -l "$LOCATION" 1> /dev/null

echo "Creating Azure Container Registry: $ACR_NAME"
az acr create \
  -n "$ACR_NAME" \
  -g "$RESOURCE_GROUP" \
  --sku Basic \
  --admin-enabled false 1> /dev/null

ACR_ID=$(az acr show -n "$ACR_NAME" --query id -o tsv)
ACR_LOGIN_SERVER=$(az acr show -n "$ACR_NAME" --query loginServer -o tsv)

echo "Creating Linux App Service Plan: $APP_PLAN"
az appservice plan create \
  -n "$APP_PLAN" \
  -g "$RESOURCE_GROUP" \
  --is-linux \
  --sku P1v3 1> /dev/null

create_webapp() {
  local NAME=$1
  echo "Creating Web App: $NAME"
  az webapp create \
    -n "$NAME" \
    -g "$RESOURCE_GROUP" \
    --plan "$APP_PLAN" \
    --runtime 'DOTNET|9.0' 1> /dev/null || true

  echo "Assigning managed identity to $NAME"
  az webapp identity assign -g "$RESOURCE_GROUP" -n "$NAME" 1> /dev/null

  PRINCIPAL_ID=$(az webapp identity show -g "$RESOURCE_GROUP" -n "$NAME" --query principalId -o tsv)
  echo "Granting AcrPull role for $NAME"
  az role assignment create \
    --assignee-object-id "$PRINCIPAL_ID" \
    --assignee-principal-type ServicePrincipal \
    --role "AcrPull" \
    --scope "$ACR_ID" 1> /dev/null || true
}

create_webapp "$WEBAPP_API"
create_webapp "$WEBAPP_AUTH"
create_webapp "$WEBAPP_FRONTEND"

echo "Setting essential app settings (WEBSITES_PORT)"
az webapp config appsettings set -g "$RESOURCE_GROUP" -n "$WEBAPP_API" --settings WEBSITES_PORT=$API_PORT 1> /dev/null
az webapp config appsettings set -g "$RESOURCE_GROUP" -n "$WEBAPP_AUTH" --settings WEBSITES_PORT=$AUTH_PORT 1> /dev/null
az webapp config appsettings set -g "$RESOURCE_GROUP" -n "$WEBAPP_FRONTEND" --settings WEBSITES_PORT=$FRONTEND_PORT 1> /dev/null

# Emit outputs for local and GitHub Actions usage
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "RESOURCE_GROUP=$RESOURCE_GROUP"
    echo "ACR_NAME=$ACR_NAME"
    echo "ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER"
    echo "WEBAPP_API=$WEBAPP_API"
    echo "WEBAPP_AUTH=$WEBAPP_AUTH"
    echo "WEBAPP_FRONTEND=$WEBAPP_FRONTEND"
  } >> "$GITHUB_OUTPUT"
fi

echo "Provisioning complete. Record these values in your CI/CD variables:"
echo "  RESOURCE_GROUP=$RESOURCE_GROUP"
echo "  ACR_NAME=$ACR_NAME"
echo "  ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER"
echo "  WEBAPP_API=$WEBAPP_API"
echo "  WEBAPP_AUTH=$WEBAPP_AUTH"
echo "  WEBAPP_FRONTEND=$WEBAPP_FRONTEND"