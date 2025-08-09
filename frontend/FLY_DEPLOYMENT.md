# Frontend Deployment to Fly.io 🚀

This guide covers deploying the Home Services frontend application to Fly.io using Docker and GitHub Actions.

## 🏗️ Architecture

The frontend is deployed as a containerized application on Fly.io with:
- **Build Stage**: Node.js 20 for building the React/Vite application
- **Runtime Stage**: Nginx Alpine for serving static files
- **Auto-scaling**: 0-3 machines based on traffic
- **Health Checks**: HTTP health endpoint at `/health`
- **Security**: Non-root user, security headers, and CSP

## 📁 Files Created

### 1. `Dockerfile`
Multi-stage Docker build:
- Builds the React app with Vite
- Serves with optimized Nginx configuration
- Runs as non-root user for security

### 2. `nginx.conf`
Production Nginx configuration with:
- SPA routing support (serves `index.html` for all routes)
- Static asset caching (1 year for JS/CSS/images)
- Security headers (CSP, X-Frame-Options, etc.)
- Gzip compression
- Health check endpoint

### 3. `fly.toml`
Fly.io application configuration:
- HTTP service on port 8080
- Auto-scaling (0-3 machines)
- Health checks every 30 seconds
- Small VM (1 CPU, 256MB RAM)

### 4. `.github/workflows/frontend-fly-deploy.yml`
GitHub Actions workflow for CI/CD:
- Triggers on frontend changes
- Supports staging/production environments
- Sets environment variables via Fly secrets
- Deploys using `flyctl`

## 🔧 Setup Instructions

### 1. Prerequisites
- Fly.io account and CLI installed
- GitHub repository with Actions enabled
- Fly.io API token as GitHub secret

### 2. GitHub Repository Setup

#### Secrets (Required)
```bash
# In GitHub Settings > Secrets and Variables > Actions
FLY_API_TOKEN=your_fly_api_token_here
```

#### Variables (Optional - for custom app names)
```bash
# Production
FLY_APP_NAME_FRONTEND_PROD=your-frontend-prod-app
FLY_REGION_PROD=ord

# Staging
FLY_APP_NAME_FRONTEND_STAGING=your-frontend-staging-app
FLY_REGION_STAGING=ord

# API URLs (for frontend to connect to backend)
VITE_API_BASE_URL_PROD=https://your-auth-api.fly.dev
VITE_API_HOST_URL_PROD=https://your-main-api.fly.dev/api/v1
VITE_API_BASE_URL_STAGING=https://your-auth-api-staging.fly.dev
VITE_API_HOST_URL_STAGING=https://your-main-api-staging.fly.dev/api/v1
```

### 3. Manual Deployment (First Time)

```bash
# Navigate to frontend directory
cd frontend

# Login to Fly.io
flyctl auth login

# Create and deploy the app
flyctl apps create homeservicesapp-frontend
flyctl deploy

# Set environment variables
flyctl secrets set VITE_API_BASE_URL="https://your-auth-api.fly.dev"
flyctl secrets set VITE_API_HOST_URL="https://your-main-api.fly.dev/api/v1"
flyctl secrets set VITE_ENVIRONMENT="production"
```

### 4. Automatic Deployment via GitHub Actions

Once the workflow is set up, deployments happen automatically:
- **Push to main/master**: Deploys to production
- **Push to other branches**: Deploys to staging
- **Manual trigger**: Via GitHub Actions "Run workflow" button

## 🌐 Environment Configuration

### Build-time Environment Variables
These are baked into the built application:

```bash
VITE_API_BASE_URL=https://your-auth-api.fly.dev
VITE_API_HOST_URL=https://your-main-api.fly.dev/api/v1
VITE_ENVIRONMENT=production
```

### Runtime Configuration
Nginx serves the built static files with proper headers and routing.

## 🔗 Backend Integration

### CORS Configuration
The backend `fly.toml` files have been updated to include the Fly.io frontend URL:

```toml
# In backend/fly.toml and backend/fly-auth.toml
App__CorsOrigins = "https://homeservicesapp-frontend.fly.dev,..."
```

### API Connectivity
The frontend connects to:
- **Auth Server**: `VITE_API_BASE_URL` (for authentication)
- **Main API**: `VITE_API_HOST_URL` (for business logic)

## 📊 Monitoring & Operations

### Health Checks
- **Endpoint**: `https://your-app.fly.dev/health`
- **Frequency**: Every 30 seconds
- **Timeout**: 5 seconds

### Scaling
- **Minimum**: 0 machines (auto-sleep when inactive)
- **Maximum**: 3 machines
- **Auto-scale**: Based on HTTP requests

### Logs
```bash
# View logs
flyctl logs --app homeservicesapp-frontend

# Follow logs in real-time
flyctl logs --app homeservicesapp-frontend -f
```

### SSH Access
```bash
# Connect to running machine
flyctl ssh console --app homeservicesapp-frontend
```

## 🔐 Security Features

### Container Security
- Non-root user (`frontend:nodejs`)
- Minimal Alpine Linux base image
- No unnecessary packages

### HTTP Security
- Force HTTPS redirects
- Security headers (CSP, X-Frame-Options, etc.)
- Protection against common attacks

### Access Control
- Nginx blocks access to hidden files
- API routes return 404 (handled by backend)

## 🚀 Deployment Process

### Automatic (GitHub Actions)
1. Code pushed to repository
2. GitHub Actions triggered
3. Frontend built in Docker container
4. Environment variables set via Fly secrets
5. Deployed to Fly.io
6. Health checks verify deployment

### Manual Deployment
```bash
cd frontend
flyctl deploy --app homeservicesapp-frontend
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   flyctl logs --app homeservicesapp-frontend
   
   # Debug build locally
   docker build -t frontend-test .
   docker run -p 8080:8080 frontend-test
   ```

2. **Environment Variables Not Set**
   ```bash
   # List current secrets
   flyctl secrets list --app homeservicesapp-frontend
   
   # Set missing variables
   flyctl secrets set VITE_API_BASE_URL="your-value"
   ```

3. **CORS Errors**
   - Verify backend CORS configuration includes Fly.io frontend URL
   - Check that API URLs in frontend environment variables are correct

4. **Health Check Failures**
   ```bash
   # Test health endpoint
   curl https://your-app.fly.dev/health
   
   # Check if Nginx is running
   flyctl ssh console --app homeservicesapp-frontend
   ps aux | grep nginx
   ```

### Performance Optimization

1. **Caching**: Static assets cached for 1 year
2. **Compression**: Gzip enabled for text files
3. **Auto-sleep**: Machines sleep when inactive to save costs
4. **CDN**: Fly.io provides global edge caching

## 📈 Scaling Considerations

### Traffic Patterns
- **Low Traffic**: Single machine, auto-sleep enabled
- **High Traffic**: Auto-scale up to 3 machines
- **Global**: Consider additional regions for international users

### Cost Optimization
- Machines sleep when inactive (no traffic)
- Small VM size (256MB RAM) sufficient for static content
- Minimal data transfer costs

## 🔄 Migration from GitHub Pages

If migrating from the existing GitHub Pages deployment:

1. **DNS**: Update DNS records to point to Fly.io app
2. **Environment**: Ensure all environment variables are configured
3. **Testing**: Test functionality before switching traffic
4. **Rollback**: Keep GitHub Pages workflow as backup

The frontend is now ready for deployment to Fly.io! 🎉