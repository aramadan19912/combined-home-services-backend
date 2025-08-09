# 🚀 Quick Start: Deploy to Supabase

This guide will help you deploy your Home Services Platform to Supabase in just a few steps.

## 📋 Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Vercel Account**: Create an account at [vercel.com](https://vercel.com) 
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## 🎯 Quick Deployment (5 Steps)

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `home-services-platform`
5. Create a strong database password and save it
6. Select a region close to your users
7. Click "Create new project"

### Step 2: Set Up Environment Variables

```bash
# Run the interactive setup script
./scripts/setup-env.sh
```

This will prompt you for:
- Supabase Project ID (from your dashboard)
- Supabase URL and Keys (from Project Settings → API)
- Database password (the one you just created)
- Your planned frontend/backend URLs

### Step 3: Deploy Database

```bash
# Source your environment variables
source .env.deployment

# Deploy database and storage
./scripts/deploy-to-supabase.sh --database-only
```

This will:
- Create all database tables
- Set up Row Level Security (RLS)
- Configure storage buckets
- Insert default data

### Step 4: Deploy Frontend to Vercel

```bash
# Deploy frontend
./scripts/deploy-to-supabase.sh --frontend-only
```

Or manually:
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Step 5: Deploy Backend (Choose One)

**Option A: Fly.io (Recommended)**
```bash
# Deploy to Fly.io
./scripts/deploy-to-supabase.sh --backend-only
```

**Option B: Railway**
1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy automatically

**Option C: Manual Docker Deployment**
- Use any Docker-compatible platform
- Set the environment variables from `.env.deployment`

## 🎉 You're Done!

Your application should now be live! Check the deployment summary for URLs.

## 🔧 Manual Setup (Detailed)

If you prefer manual setup or encounter issues, follow the detailed guide below.

### 1. Supabase Project Setup

#### Create Project
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project with these settings:
   - Name: `home-services-platform`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users

#### Get Project Credentials
1. Go to Project Settings → API
2. Copy these values:
   - Project URL
   - Project ID (from URL)
   - `anon` public key
   - `service_role` secret key

### 2. Database Setup

#### Install Supabase CLI
```bash
# macOS/Linux
curl -sSfL https://supabase.com/install.sh | sh

# Windows (PowerShell)
iwr -useb https://supabase.com/install.ps1 | iex

# Or download from GitHub releases
```

#### Initialize and Deploy
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push database migrations
supabase db push

# Create storage buckets
supabase storage create-bucket avatars --public
supabase storage create-bucket service-images --public
supabase storage create-bucket documents --private
```

### 3. Frontend Deployment

#### Update Environment Variables
Create `frontend/.env.production`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=https://your-backend-url.com
```

#### Deploy to Vercel
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Build and deploy
npm run build
vercel --prod
```

#### Configure Vercel Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

### 4. Backend Deployment

#### Update Configuration
Update `backend/src/HomeServicesApp.HttpApi.Host/appsettings.Production.json`:
```json
{
  "Database": {
    "Provider": "PostgreSql"
  },
  "ConnectionStrings": {
    "Default": "Host=db.YOUR_PROJECT_ID.supabase.co;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;Port=5432;SSL Mode=Require;"
  },
  "Supabase": {
    "Url": "https://YOUR_PROJECT_ID.supabase.co",
    "Key": "YOUR_ANON_KEY"
  }
}
```

#### Deploy to Fly.io
```bash
cd backend

# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and create app
flyctl auth login
flyctl launch

# Set environment variables
flyctl secrets set ConnectionStrings__Default="your_connection_string"
flyctl secrets set Supabase__Url="https://YOUR_PROJECT_ID.supabase.co"
flyctl secrets set Supabase__Key="YOUR_ANON_KEY"

# Deploy
flyctl deploy
```

### 5. Configure Authentication

#### Supabase Auth Settings
1. Go to Authentication → Settings in Supabase Dashboard
2. Set Site URL: `https://your-frontend-domain.vercel.app`
3. Add Redirect URLs:
   - `https://your-frontend-domain.vercel.app/**`
   - `http://localhost:5173/**` (for development)

#### Google OAuth (Optional)
1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Add your Google OAuth credentials
4. Update frontend environment variables

### 6. Test Your Deployment

#### Health Checks
```bash
# Test database connection
curl https://YOUR_PROJECT_ID.supabase.co/rest/v1/

# Test backend API
curl https://your-backend-url.com/health

# Test frontend
curl https://your-frontend-domain.vercel.app
```

#### User Flow Test
1. Visit your frontend URL
2. Try registering a new account
3. Verify email confirmation works
4. Test login/logout
5. Test core features

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify connection string format
- Check database password
- Ensure SSL Mode is set to "Require"

#### CORS Errors
- Update CORS origins in backend configuration
- Include both HTTP and HTTPS versions
- Add your Vercel deployment URL

#### Authentication Issues
- Check redirect URLs in Supabase
- Verify environment variables
- Test with incognito/private browsing

#### Build Failures
- Check all environment variables are set
- Verify Node.js version compatibility
- Review build logs for specific errors

### Getting Help

1. **Supabase**: [docs.supabase.com](https://docs.supabase.com)
2. **Vercel**: [vercel.com/docs](https://vercel.com/docs)
3. **Fly.io**: [fly.io/docs](https://fly.io/docs)

## 📊 Monitoring & Maintenance

### Supabase Dashboard
- Monitor database performance
- Check auth metrics
- Review storage usage
- Monitor real-time connections

### Application Monitoring
- Set up error tracking (Sentry)
- Monitor API performance
- Track user analytics
- Set up uptime monitoring

### Regular Maintenance
- Update dependencies
- Review security logs
- Backup database
- Monitor costs and usage

## 🚀 Next Steps

1. **Custom Domain**: Set up custom domains for your frontend and backend
2. **SSL Certificates**: Ensure HTTPS is properly configured
3. **CDN**: Consider using a CDN for better performance
4. **Monitoring**: Set up comprehensive monitoring and alerting
5. **Scaling**: Plan for horizontal scaling as your app grows

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments)
- [ASP.NET Core Deployment](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**🎉 Congratulations! Your Home Services Platform is now live on Supabase!**