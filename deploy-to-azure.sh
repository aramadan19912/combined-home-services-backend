#!/bin/bash

# Azure Deployment Script for Home Services App
# This script creates all Azure resources and deploys both frontend and backend

set -e

# Configuration
RESOURCE_GROUP="homeservices-rg"
LOCATION="East US"
SQL_SERVER_NAME="homeservices-sql-server"
DATABASE_NAME="homeservices-db"
STORAGE_ACCOUNT="homeservicesstorageacc"
APP_SERVICE_PLAN="homeservices-plan"
API_APP_NAME="homeservices-api"
STATIC_WEB_APP_NAME="homeservices-frontend"
SQL_ADMIN_USER="homeservicesadmin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    print_error "You are not logged in to Azure. Please run 'az login' first."
    exit 1
fi

print_status "Starting Azure deployment for Home Services App..."

# Get SQL password from user
read -s -p "Enter a strong password for SQL Server admin: " SQL_PASSWORD
echo

# Generate JWT secret key
JWT_SECRET=$(openssl rand -base64 32)

print_status "Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output table

print_status "Creating SQL Server and Database..."
az sql server create \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --admin-user $SQL_ADMIN_USER \
  --admin-password "$SQL_PASSWORD" \
  --output table

az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name $DATABASE_NAME \
  --service-objective Basic \
  --output table

# Configure firewall for Azure services
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0 \
  --output table

print_status "Creating Storage Account..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --output table

# Get storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

# Create blob container
az storage container create \
  --name uploads \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob \
  --output table

print_status "Creating App Service Plan and Web App..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux \
  --output table

az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $API_APP_NAME \
  --runtime "DOTNETCORE:9.0" \
  --output table

print_status "Configuring App Service settings..."

# Build connection string
CONNECTION_STRING="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Initial Catalog=${DATABASE_NAME};Persist Security Info=False;User ID=${SQL_ADMIN_USER};Password=${SQL_PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Set connection string
az webapp config connection-string set \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="$CONNECTION_STRING" \
  --output table

# Set app settings
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    Jwt__Key="$JWT_SECRET" \
    Jwt__Issuer="https://${API_APP_NAME}.azurewebsites.net" \
    Jwt__Audience="https://${STATIC_WEB_APP_NAME}.azurestaticapps.net" \
    FileStorage__ConnectionString="$STORAGE_CONNECTION_STRING" \
    CORS__AllowedOrigins="https://${STATIC_WEB_APP_NAME}.azurestaticapps.net" \
  --output table

print_status "Creating Static Web App..."
print_warning "You'll need to provide your GitHub repository URL when prompted."

read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo): " GITHUB_REPO

az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source "$GITHUB_REPO" \
  --location "East US2" \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --output table

print_status "Getting deployment tokens..."

# Get publish profile for backend
BACKEND_PUBLISH_PROFILE=$(az webapp deployment list-publishing-profiles \
  --resource-group $RESOURCE_GROUP \
  --name $API_APP_NAME \
  --xml)

# Get Static Web App token
FRONTEND_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey -o tsv)

print_status "Deployment completed successfully!"
echo
print_status "=== DEPLOYMENT SUMMARY ==="
echo "Resource Group: $RESOURCE_GROUP"
echo "Backend API URL: https://${API_APP_NAME}.azurewebsites.net"
echo "Frontend URL: https://${STATIC_WEB_APP_NAME}.azurestaticapps.net"
echo "SQL Server: ${SQL_SERVER_NAME}.database.windows.net"
echo "Database: $DATABASE_NAME"
echo "Storage Account: $STORAGE_ACCOUNT"
echo
print_status "=== NEXT STEPS ==="
echo "1. Add the following secrets to your GitHub repository:"
echo "   - AZURE_WEBAPP_PUBLISH_PROFILE (for backend deployment)"
echo "   - AZURE_STATIC_WEB_APPS_API_TOKEN (for frontend deployment)"
echo "   - DATABASE_CONNECTION_STRING (for EF migrations)"
echo
echo "2. Push your code to the main branch to trigger automatic deployment"
echo
print_status "=== GITHUB SECRETS ==="
echo "AZURE_WEBAPP_PUBLISH_PROFILE:"
echo "$BACKEND_PUBLISH_PROFILE"
echo
echo "AZURE_STATIC_WEB_APPS_API_TOKEN:"
echo "$FRONTEND_TOKEN"
echo
echo "DATABASE_CONNECTION_STRING:"
echo "$CONNECTION_STRING"
echo
print_status "Save these values securely and add them to your GitHub repository secrets!"