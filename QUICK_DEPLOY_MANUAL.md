# 🚀 Quick Manual Deployment Guide

If you prefer to deploy manually or the automated script has issues, follow these steps:

## 🚂 Step 1: Deploy Backend to Railway

### 1.1 Login to Railway
```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login
```

### 1.2 Deploy Backend
```bash
cd backend

# Initialize Railway project
railway init

# Add PostgreSQL database
railway add postgresql

# Set environment variables
railway variables set ENCRYPTION_KEY="$(openssl rand -base64 48)"
railway variables set CORS_ORIGINS="http://localhost:3000"

# Deploy
railway up
```

### 1.3 Get Backend URL
```bash
# Get your Railway domain
railway domain

# Copy this URL - you'll need it for frontend configuration
```

## ⚡ Step 2: Deploy Frontend to Vercel

### 2.1 Login to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login
```

### 2.2 Deploy Frontend
```bash
cd frontend

# Set environment variables (replace with your Railway URL)
vercel env add VITE_API_BASE_URL production
# Enter: https://your-backend.railway.app

vercel env add VITE_API_HOST_URL production  
# Enter: https://your-backend.railway.app/api/v1

vercel env add VITE_AUTH_SERVER_URL production
# Enter: https://your-backend.railway.app

vercel env add VITE_ENVIRONMENT production
# Enter: production

# Deploy
vercel --prod
```

## 🔄 Step 3: Update CORS Configuration

### 3.1 Update Backend CORS
```bash
cd backend

# Update CORS with your Vercel URL
railway variables set CORS_ORIGINS="https://your-app.vercel.app,http://localhost:3000"
```

## ✅ Step 4: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit your Railway URL + `/health`
3. **API**: Test API endpoints from the frontend

## 🎯 Expected Results

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app
- **Database**: PostgreSQL on Railway
- **Cost**: $0

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables
```

### Frontend Issues
```bash
# Check Vercel logs
vercel logs

# Redeploy if needed
vercel --prod
```

### Database Issues
```bash
# Railway will auto-run migrations
# Check logs for migration status
railway logs
```

## 📱 Alternative: GitHub Integration

If CLI deployment doesn't work, you can also:

1. **Railway**: Connect your GitHub repo directly in the Railway dashboard
2. **Vercel**: Connect your GitHub repo directly in the Vercel dashboard

Both platforms support automatic deployments from GitHub pushes.

---

Your application will be live on production-grade infrastructure at **$0 cost**! 🎉