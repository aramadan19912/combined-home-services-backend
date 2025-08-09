# Fly.io Deployment Guide for HomeServices App

This guide will help you deploy three applications to fly.io:
1. Frontend (React/Vite app)
2. Backend API (.NET Core)
3. Auth Service (.NET Core)

## Prerequisites

1. **Install Fly CLI** (if not already installed):
```bash
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"
```

2. **Authenticate with Fly.io**:
```bash
fly auth login
```
This will open a browser window for authentication.

## Application Configurations

### 1. Frontend App (`homeservicesapp-frontend`)
- **Location**: `/workspace/frontend/`
- **Config File**: `fly.toml`
- **Docker File**: `Dockerfile`
- **Internal Port**: 8080
- **Health Check**: `/health`

### 2. Backend API (`homeservicesapp-api`)
- **Location**: `/workspace/backend/`
- **Config File**: `fly.toml`
- **Docker File**: `Dockerfile`
- **Internal Port**: 8080
- **Health Check**: `/swagger`

### 3. Auth Service (`homeservicesapp-auth`)
- **Location**: `/workspace/backend/`
- **Config File**: `fly-auth.toml`
- **Docker File**: `AuthServer.Dockerfile`
- **Internal Port**: 8081

## Deployment Steps

### Step 1: Deploy Frontend Application

```bash
cd /workspace/frontend
fly deploy
```

This will:
- Build the Docker image using the `Dockerfile`
- Deploy to the `homeservicesapp-frontend` app
- Set up auto-scaling (0-3 machines)
- Configure HTTPS and health checks

### Step 2: Deploy Backend API

```bash
cd /workspace/backend
fly deploy
```

This will:
- Build the Docker image using the `Dockerfile`
- Deploy to the `homeservicesapp-api` app
- Mount persistent storage for the database
- Configure CORS for the frontend

### Step 3: Deploy Auth Service

```bash
cd /workspace/backend
fly deploy --config fly-auth.toml
```

This will:
- Build the Docker image using `AuthServer.Dockerfile`
- Deploy to the `homeservicesapp-auth` app
- Mount persistent storage for shared database
- Configure authentication endpoints

## Post-Deployment Configuration

### 1. Update Environment Variables

After deployment, you may need to update environment variables:

**Frontend**: Update API endpoints
```bash
fly -a homeservicesapp-frontend secrets set \
  VITE_API_BASE_URL=https://homeservicesapp-api.fly.dev \
  VITE_AUTH_URL=https://homeservicesapp-auth.fly.dev
```

**Backend API**: Update CORS origins
```bash
fly -a homeservicesapp-api secrets set \
  "App__CorsOrigins=https://homeservicesapp-frontend.fly.dev,https://homeservicesapp-auth.fly.dev"
```

**Auth Service**: Update URLs
```bash
fly -a homeservicesapp-auth secrets set \
  "App__SelfUrl=https://homeservicesapp-auth.fly.dev" \
  "App__ClientUrl=https://homeservicesapp-frontend.fly.dev" \
  "App__CorsOrigins=https://homeservicesapp-frontend.fly.dev"
```

### 2. Create Shared Database Volume (if needed)

If the apps need to share a database:
```bash
fly -a homeservicesapp-api volumes create data --region ord --size 1
fly -a homeservicesapp-auth volumes create data --region ord --size 1
```

## Verification Steps

### 1. Check Application Status
```bash
fly -a homeservicesapp-frontend status
fly -a homeservicesapp-api status
fly -a homeservicesapp-auth status
```

### 2. View Application Logs
```bash
fly -a homeservicesapp-frontend logs
fly -a homeservicesapp-api logs
fly -a homeservicesapp-auth logs
```

### 3. Test Application URLs
- Frontend: https://homeservicesapp-frontend.fly.dev
- Backend API: https://homeservicesapp-api.fly.dev/swagger
- Auth Service: https://homeservicesapp-auth.fly.dev

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Run `fly auth login` to re-authenticate
2. **Build Failed**: Check Dockerfile and dependencies
3. **App Not Starting**: Check logs with `fly logs -a <app-name>`
4. **Database Issues**: Verify volume mounts and connection strings

### Useful Commands

```bash
# Scale applications
fly -a homeservicesapp-frontend scale count 2
fly -a homeservicesapp-api scale count 1
fly -a homeservicesapp-auth scale count 1

# Update applications
fly -a homeservicesapp-frontend deploy
fly -a homeservicesapp-api deploy
fly -a homeservicesapp-auth deploy --config fly-auth.toml

# SSH into machines
fly -a homeservicesapp-frontend ssh console
fly -a homeservicesapp-api ssh console
fly -a homeservicesapp-auth ssh console

# View secrets
fly -a homeservicesapp-frontend secrets list
fly -a homeservicesapp-api secrets list
fly -a homeservicesapp-auth secrets list
```

## Application URLs After Deployment

Once deployed, your applications will be available at:
- **Frontend**: https://homeservicesapp-frontend.fly.dev
- **Backend API**: https://homeservicesapp-api.fly.dev
- **Auth Service**: https://homeservicesapp-auth.fly.dev

## Notes

- All applications are configured for the `ord` (Chicago) region
- Auto-scaling is enabled for cost optimization
- Health checks are configured for automatic restart
- Persistent storage is mounted for database files
- HTTPS is enforced for all applications