# 🚀 Free Hosting Deployment Guide

This guide will help you deploy your Home Services application to **completely free** hosting platforms.

## 📋 Overview

- **Backend**: Railway (Free tier - 500 hours/month)
- **Frontend**: Vercel (Free tier - unlimited for personal projects)
- **Database**: PostgreSQL on Railway (Free tier - 1GB storage)

## 🎯 Prerequisites

1. GitHub account
2. Railway account (sign up at [railway.app](https://railway.app))
3. Vercel account (sign up at [vercel.com](https://vercel.com))

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# If not already done, initialize git and push to GitHub
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 1.2 Verify Files
Ensure these deployment files are in your repository:
- `backend/Dockerfile`
- `backend/railway.json`
- `backend/src/HomeServicesApp.HttpApi.Host/appsettings.Production.json`
- `frontend/vercel.json`
- `frontend/.env.production`

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2.2 Configure Backend Service
1. Select the `backend` directory as your build context
2. Railway will automatically detect the Dockerfile
3. Wait for the initial build (may take 5-10 minutes)

### 2.3 Add PostgreSQL Database
1. In your Railway project, click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically provision a free PostgreSQL instance

### 2.4 Configure Environment Variables
In Railway dashboard, go to your backend service → Variables and add:

```bash
# Railway provides these automatically when you add PostgreSQL
DATABASE_URL=${{Postgres.DATABASE_URL}}

# CORS - Update with your Vercel domain after frontend deployment
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# Auth Server - Use your Railway backend URL
AUTH_SERVER_URL=https://your-backend.railway.app

# Encryption key - Generate a random 32+ character string
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars

# Redis (Optional - for caching, leave empty for now)
REDIS_URL=

# Railway automatically provides PORT
PORT=${{PORT}}
```

### 2.5 Update Domain Settings
1. Go to Settings → Domains in your Railway service
2. Copy the generated domain (e.g., `your-backend.railway.app`)
3. Update `AUTH_SERVER_URL` environment variable with this domain

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Set the **Root Directory** to `frontend`

### 3.2 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```bash
# Replace with your actual Railway backend URL
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_API_HOST_URL=https://your-backend.railway.app/api/v1
VITE_AUTH_SERVER_URL=https://your-backend.railway.app
VITE_ENVIRONMENT=production

# Optional analytics (leave commented for now)
# VITE_SENTRY_DSN=your-sentry-dsn
# VITE_GA_MEASUREMENT_ID=your-ga-id
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Copy your Vercel domain (e.g., `your-app.vercel.app`)

## 🔄 Step 4: Update CORS Configuration

### 4.1 Update Railway Environment
1. Go back to Railway → Your Backend Service → Variables
2. Update `CORS_ORIGINS` to include your Vercel domain:
```bash
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### 4.2 Redeploy Backend
1. In Railway, go to Deployments
2. Click "Redeploy" on the latest deployment

## 🗄️ Step 5: Database Setup

### 5.1 Run Database Migrations
Once your backend is deployed and running:

1. **Option A: Via Railway Console**
   ```bash
   # In Railway console for your backend service
   dotnet ef database update --project src/HomeServicesApp.EntityFrameworkCore
   ```

2. **Option B: Use DbMigrator (Recommended)**
   The ABP framework includes a DbMigrator project that will automatically run migrations on startup.

### 5.2 Verify Database Connection
Check your Railway backend logs to ensure the database connection is successful.

## ✅ Step 6: Verification & Testing

### 6.1 Test Backend API
```bash
# Health check
curl https://your-backend.railway.app/health

# Swagger UI (if enabled)
https://your-backend.railway.app/swagger
```

### 6.2 Test Frontend
1. Visit `https://your-app.vercel.app`
2. Verify the app loads correctly
3. Test API connectivity (login, registration, etc.)

### 6.3 Check CORS
Open browser developer tools and verify no CORS errors in the console.

## 🔧 Step 7: Custom Domains (Optional)

### 7.1 Frontend Domain (Vercel)
1. Go to Vercel → Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 7.2 Backend Domain (Railway)
1. Go to Railway → Service Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 📊 Monitoring & Maintenance

### Resource Limits (Free Tiers)
- **Railway**: 500 hours/month, 1GB PostgreSQL storage
- **Vercel**: Unlimited builds, 100GB bandwidth/month

### Monitoring Tips
1. **Railway**: Monitor usage in dashboard to avoid hitting limits
2. **Vercel**: Check build logs for any issues
3. **Database**: Monitor PostgreSQL storage usage

### Logs Access
- **Railway**: Real-time logs in the dashboard
- **Vercel**: Function logs and build logs available
- **Database**: Query logs via Railway PostgreSQL service

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check .NET version compatibility
   # Ensure all NuGet packages are compatible with .NET 9.0
   ```

2. **Database Connection Issues**
   ```bash
   # Verify DATABASE_URL environment variable
   # Check PostgreSQL service is running in Railway
   ```

3. **CORS Errors**
   ```bash
   # Ensure CORS_ORIGINS includes your Vercel domain
   # Check appsettings.Production.json configuration
   ```

4. **Frontend API Errors**
   ```bash
   # Verify VITE_API_BASE_URL points to correct Railway domain
   # Check browser network tab for actual API calls
   ```

### Environment Variable Template

Create a `.env.template` file for easy reference:

```bash
# Backend (Railway)
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
AUTH_SERVER_URL=https://your-backend.railway.app
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
REDIS_URL=
PORT=5000

# Frontend (Vercel)
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_API_HOST_URL=https://your-backend.railway.app/api/v1
VITE_AUTH_SERVER_URL=https://your-backend.railway.app
VITE_ENVIRONMENT=production
```

## 🎉 Success!

Your Home Services application is now deployed on free hosting platforms:

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app
- **Database**: PostgreSQL on Railway

Both platforms offer excellent performance, automatic scaling, and zero cost for personal projects!

## 💡 Next Steps

1. **SSL Certificates**: Automatically provided by both platforms
2. **Custom Domains**: Configure DNS for your own domains
3. **Monitoring**: Set up error tracking with Sentry
4. **Analytics**: Add Google Analytics or similar
5. **Performance**: Monitor Core Web Vitals in Vercel
6. **Backups**: Consider setting up database backups for production

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [ABP Framework Documentation](https://docs.abp.io)
- [Railway Pricing](https://railway.app/pricing)
- [Vercel Pricing](https://vercel.com/pricing)