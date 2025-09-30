// Azure Bicep Template for Home Services App
// Deploy with: az deployment group create -g <RESOURCE_GROUP> -f main.bicep

@description('Location for all resources')
param location string = resourceGroup().location

@description('Unique suffix for resource names')
param uniqueSuffix string = uniqueString(resourceGroup().id)

@description('Environment name (dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('Database provider (Sqlite or PostgreSql)')
@allowed([
  'Sqlite'
  'PostgreSql'
])
param databaseProvider string = 'Sqlite'

@description('PostgreSQL connection string (required if databaseProvider is PostgreSql)')
@secure()
param postgresConnectionString string = ''

@description('App Service Plan SKU')
@allowed([
  'B1'
  'B2'
  'P1v3'
  'P2v3'
])
param appServiceSku string = 'B1'

// Variables
var acrName = 'hsappacr${uniqueSuffix}'
var appServicePlanName = 'hsapp-asp-${environment}'
var apiAppName = 'hsapp-api-${environment}-${uniqueSuffix}'
var authAppName = 'hsapp-auth-${environment}-${uniqueSuffix}'
var frontendAppName = 'hsapp-frontend-${environment}-${uniqueSuffix}'
var tags = {
  environment: environment
  application: 'HomeServicesApp'
  managedBy: 'Bicep'
}

// Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: appServiceSku
    tier: appServiceSku == 'B1' || appServiceSku == 'B2' ? 'Basic' : 'PremiumV3'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// API Web App
resource apiApp 'Microsoft.Web/sites@2022-09-01' = {
  name: apiAppName
  location: location
  tags: tags
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/hsapp-api:latest'
      acrUseManagedIdentityCreds: true
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acr.properties.loginServer}'
        }
        {
          name: 'Database__Provider'
          value: databaseProvider
        }
        {
          name: 'ConnectionStrings__Default'
          value: databaseProvider == 'Sqlite' ? 'Data Source=/data/app.db' : postgresConnectionString
        }
        {
          name: 'App__SelfUrl'
          value: 'https://${apiAppName}.azurewebsites.net'
        }
        {
          name: 'App__CorsOrigins'
          value: 'https://${frontendAppName}.azurewebsites.net'
        }
        {
          name: 'AuthServer__Authority'
          value: 'https://${authAppName}.azurewebsites.net'
        }
        {
          name: 'AuthServer__RequireHttpsMetadata'
          value: 'true'
        }
      ]
      alwaysOn: appServiceSku != 'B1'
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
    }
  }
}

// Auth Server Web App
resource authApp 'Microsoft.Web/sites@2022-09-01' = {
  name: authAppName
  location: location
  tags: tags
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/hsapp-auth:latest'
      acrUseManagedIdentityCreds: true
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8081'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acr.properties.loginServer}'
        }
        {
          name: 'Database__Provider'
          value: databaseProvider
        }
        {
          name: 'ConnectionStrings__Default'
          value: databaseProvider == 'Sqlite' ? 'Data Source=/data/auth.db' : postgresConnectionString
        }
        {
          name: 'App__SelfUrl'
          value: 'https://${authAppName}.azurewebsites.net'
        }
        {
          name: 'App__ClientUrl'
          value: 'https://${frontendAppName}.azurewebsites.net'
        }
        {
          name: 'App__CorsOrigins'
          value: 'https://${frontendAppName}.azurewebsites.net'
        }
        {
          name: 'App__RedirectAllowedUrls'
          value: 'https://${frontendAppName}.azurewebsites.net'
        }
      ]
      alwaysOn: appServiceSku != 'B1'
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
    }
  }
}

// Frontend Web App
resource frontendApp 'Microsoft.Web/sites@2022-09-01' = {
  name: frontendAppName
  location: location
  tags: tags
  kind: 'app,linux,container'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.properties.loginServer}/hsapp-frontend:latest'
      acrUseManagedIdentityCreds: true
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acr.properties.loginServer}'
        }
        {
          name: 'VITE_API_BASE_URL'
          value: 'https://${authAppName}.azurewebsites.net'
        }
        {
          name: 'VITE_API_HOST_URL'
          value: 'https://${apiAppName}.azurewebsites.net/api/v1'
        }
        {
          name: 'VITE_ENVIRONMENT'
          value: 'production'
        }
      ]
      alwaysOn: appServiceSku != 'B1'
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
    }
  }
}

// Grant ACR Pull permission to API app
resource apiAcrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, apiApp.id, 'AcrPull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull role
    principalId: apiApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Grant ACR Pull permission to Auth app
resource authAcrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, authApp.id, 'AcrPull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull role
    principalId: authApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Grant ACR Pull permission to Frontend app
resource frontendAcrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, frontendApp.id, 'AcrPull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull role
    principalId: frontendApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs
output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
output apiAppName string = apiApp.name
output apiAppUrl string = 'https://${apiApp.properties.defaultHostName}'
output authAppName string = authApp.name
output authAppUrl string = 'https://${authApp.properties.defaultHostName}'
output frontendAppName string = frontendApp.name
output frontendAppUrl string = 'https://${frontendApp.properties.defaultHostName}'
output resourceGroupName string = resourceGroup().name