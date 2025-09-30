# 🏗️ Azure Architecture Overview

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Internet Users                            │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                     Azure Front Door (Optional)                   │
│                  - Global Load Balancing                          │
│                  - WAF Protection                                 │
│                  - SSL Termination                                │
└───────────────────────────┬──────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Frontend    │   │   Auth Server │   │   API Server  │
│   Web App     │   │   Web App     │   │   Web App     │
│               │   │               │   │               │
│ nginx:alpine  │   │ .NET 9.0     │   │ .NET 9.0      │
│ React/Vite    │   │ OpenIddict   │   │ ASP.NET Core  │
│               │   │               │   │               │
│ Port: 8080    │   │ Port: 8081   │   │ Port: 8080    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            │ Managed Identity
                            │
                ┌───────────▼──────────┐
                │  Container Registry  │
                │  (ACR)              │
                │                     │
                │  - hsapp-api        │
                │  - hsapp-auth       │
                │  - hsapp-frontend   │
                └─────────────────────┘
```

## Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Load React App
       ▼
┌──────────────┐
│  Frontend    │
│  (Port 8080) │
└──────┬───────┘
       │
       │ 2. Request Authentication
       ▼
┌──────────────┐
│ Auth Server  │
│ (Port 8081)  │
└──────┬───────┘
       │
       │ 3. Return JWT Token
       │
       │ 4. API Calls with JWT
       ▼
┌──────────────┐
│  API Server  │
│ (Port 8080)  │
└──────┬───────┘
       │
       │ 5. Validate Token
       │
       │ 6. Query Database
       ▼
┌──────────────┐
│   Database   │
│ SQLite/PG    │
└──────────────┘
```

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────┐
│           Resource Group: hsapp-rg              │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │    App Service Plan: hsapp-asp            │ │
│  │    SKU: B1 (Basic)                        │ │
│  │    OS: Linux                              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Frontend │  │   Auth   │  │     API      │ │
│  │ Web App  │  │ Web App  │  │   Web App    │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Azure Container Registry (ACR)           │ │
│  │  SKU: Basic                               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Database: SQLite (embedded)                   │
│                                                 │
│  Monthly Cost: ~$18                             │
└─────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────┐
│           Resource Group: hsapp-rg              │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │    App Service Plan: hsapp-asp            │ │
│  │    SKU: P1v3 (Premium)                    │ │
│  │    OS: Linux                              │ │
│  │    Auto-scale: 1-5 instances              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Frontend │  │   Auth   │  │     API      │ │
│  │ Web App  │  │ Web App  │  │   Web App    │ │
│  │ (Scaled) │  │ (Scaled) │  │  (Scaled)    │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Azure Container Registry (ACR)           │ │
│  │  SKU: Standard                            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Azure Database for PostgreSQL            │ │
│  │  SKU: Standard_B1ms                       │ │
│  │  - Automated backups                      │ │
│  │  - Point-in-time restore                  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Application Insights                     │ │
│  │  - Performance monitoring                 │ │
│  │  - Error tracking                         │ │
│  │  - Usage analytics                        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Azure Front Door                         │ │
│  │  - Global CDN                             │ │
│  │  - WAF protection                         │ │
│  │  - Custom domain + SSL                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Azure Key Vault                          │ │
│  │  - Secrets management                     │ │
│  │  - Certificate storage                    │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Monthly Cost: ~$200-300                        │
└─────────────────────────────────────────────────┘
```

## CI/CD Pipeline

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │
       │ git push
       ▼
┌──────────────┐
│   GitHub     │
└──────┬───────┘
       │
       │ Trigger
       ▼
┌─────────────────────────────────────────┐
│       GitHub Actions Workflow            │
│                                          │
│  1. Checkout code                        │
│  2. Azure Login (OIDC)                   │
│  3. Build Docker images                  │
│  4. Push to ACR                          │
│  5. Deploy to Web Apps                   │
│  6. Update app settings                  │
│  7. Restart services                     │
└──────┬───────────────────────────────────┘
       │
       │ Deployment
       ▼
┌──────────────┐
│  Azure Apps  │
└──────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────┐
│              Security Layers                      │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Layer 1: Azure AD Authentication          │ │
│  │  - OIDC/OAuth 2.0                          │ │
│  │  - Federated credentials for GitHub        │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Layer 2: Network Security                 │ │
│  │  - HTTPS only (TLS 1.2+)                   │ │
│  │  - CORS configured                         │ │
│  │  - Azure Front Door WAF (optional)         │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Layer 3: Identity & Access                │ │
│  │  - Managed Identities for Azure resources │ │
│  │  - No stored credentials                   │ │
│  │  - RBAC for ACR access                     │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Layer 4: Application Security             │ │
│  │  - JWT token validation                    │ │
│  │  - Role-based authorization                │ │
│  │  - Input validation                        │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Layer 5: Data Security                    │ │
│  │  - Encrypted connections (SSL)             │ │
│  │  - Secrets in Key Vault                    │ │
│  │  - Database encryption at rest             │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## Scaling Strategy

### Vertical Scaling (Scale Up)

```
Development     →    Staging        →    Production
    B1          →       B2          →       P1v3
  $13/mo        →     $35/mo        →      $78/mo

1 vCore              2 vCores              2 vCores
1.75 GB RAM          3.5 GB RAM            8 GB RAM
```

### Horizontal Scaling (Scale Out)

```
Low Traffic         Medium Traffic      High Traffic
   1 Instance     →    3 Instances   →   5 Instances
   
   [Frontend]     →    [F] [F] [F]   →   [F] [F] [F] [F] [F]
   [API]          →    [A] [A] [A]   →   [A] [A] [A] [A] [A]
   [Auth]         →    [Au][Au][Au]  →   [Au][Au][Au][Au][Au]
```

## Monitoring Architecture

```
┌─────────────────────────────────────────────────┐
│           Application Insights                   │
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐│
│  │  Performance   │  │  Availability          ││
│  │  - Response    │  │  - Uptime monitoring   ││
│  │  - Dependencies│  │  - Health checks       ││
│  │  - Failures    │  │  - Alert rules         ││
│  └────────────────┘  └────────────────────────┘│
│                                                  │
│  ┌────────────────┐  ┌────────────────────────┐│
│  │  Usage         │  │  Logs                  ││
│  │  - Page views  │  │  - Application logs    ││
│  │  - User flows  │  │  - Exception tracking  ││
│  │  - Events      │  │  - Custom telemetry    ││
│  └────────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────┐
│              Azure Monitor                       │
│                                                  │
│  - Metrics aggregation                           │
│  - Alerting                                      │
│  - Dashboards                                    │
│  - Log Analytics                                 │
└─────────────────────────────────────────────────┘
```

## Disaster Recovery

```
┌──────────────────────────────────────────────┐
│         Primary Region (East US)              │
│                                               │
│  [Frontend] [API] [Auth]                     │
│           │                                   │
│           ▼                                   │
│     [PostgreSQL]                              │
│           │                                   │
│           │ Geo-Replication                  │
│           ▼                                   │
└───────────┼───────────────────────────────────┘
            │
            │
┌───────────▼───────────────────────────────────┐
│      Secondary Region (West US 2)             │
│                                               │
│  [Frontend] [API] [Auth]                     │
│           │                                   │
│           ▼                                   │
│     [PostgreSQL Replica]                      │
│                                               │
│  RTO: < 5 minutes                             │
│  RPO: < 1 minute                              │
└───────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query
- **Web Server**: Nginx (Alpine Linux)

### Backend
- **Framework**: ASP.NET Core 9.0
- **Authentication**: OpenIddict
- **ORM**: Entity Framework Core
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Runtime**: .NET 9.0 Runtime

### Infrastructure
- **Cloud Provider**: Microsoft Azure
- **Container Registry**: Azure Container Registry
- **Hosting**: Azure App Service (Linux)
- **Database**: Azure Database for PostgreSQL
- **Monitoring**: Application Insights
- **CI/CD**: GitHub Actions

### DevOps
- **Version Control**: Git/GitHub
- **CI/CD**: GitHub Actions
- **IaC**: Bash Scripts + Bicep
- **Containerization**: Docker
- **Orchestration**: Azure App Service

## Resource Naming Convention

```
Pattern: {app}-{service}-{environment}-{random}

Examples:
- hsapp-api-dev-a1b2c3
- hsapp-auth-prod-x9y8z7
- hsapp-frontend-staging-m5n4p3

Resource Types:
- Resource Group:     hsapp-rg
- ACR:                hsappacr{random}
- App Service Plan:   hsapp-asp-{env}
- Web App:            hsapp-{service}-{env}-{random}
- PostgreSQL:         hsapp-db-{env}
- Key Vault:          hsapp-kv-{env}
- App Insights:       hsapp-insights-{env}
```

## Network Architecture

```
┌────────────────────────────────────────────────┐
│             Internet (Public)                   │
└──────────────────┬─────────────────────────────┘
                   │
                   │ Port 443 (HTTPS)
                   │
┌──────────────────▼─────────────────────────────┐
│          Azure Load Balancer                    │
└──────────────────┬─────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│Frontend  │ │  Auth    │ │   API    │
│:8080     │ │  :8081   │ │  :8080   │
└──────────┘ └──────────┘ └──────────┘
      │            │            │
      └────────────┼────────────┘
                   │
                   │ Private Network
                   │
           ┌───────▼────────┐
           │   PostgreSQL   │
           │   :5432        │
           └────────────────┘
```

---

This architecture is designed for:
- ✅ High availability
- ✅ Scalability
- ✅ Security
- ✅ Cost optimization
- ✅ Easy maintenance
- ✅ Disaster recovery

For deployment instructions, see [AZURE_SETUP_INSTRUCTIONS.md](AZURE_SETUP_INSTRUCTIONS.md).