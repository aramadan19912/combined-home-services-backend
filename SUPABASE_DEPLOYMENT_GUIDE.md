# Supabase Hybrid Deployment Guide

This guide shows how to deploy your Home Services Platform using Supabase services while maintaining your ASP.NET Core backend.

## 🏗️ Architecture Overview

- **Frontend**: React TypeScript → Vercel/Netlify (with Supabase integration)
- **Backend**: ASP.NET Core → Fly.io/Railway/Azure (with Supabase PostgreSQL)
- **Database**: PostgreSQL → Supabase
- **Auth**: Supabase Auth (replace current JWT system)
- **Storage**: Supabase Storage (for file uploads)
- **Real-time**: Supabase Realtime (for live updates)

## 📋 Prerequisites

1. [Supabase Account](https://supabase.com)
2. [Supabase CLI](https://supabase.com/docs/guides/cli)
3. [Vercel Account](https://vercel.com) (for frontend hosting)
4. Existing Fly.io setup (or choose alternative for backend)

## 🚀 Step 1: Setup Supabase Project

### 1.1 Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (or use existing one)
# Go to https://supabase.com/dashboard and create a project
```

### 1.2 Initialize Local Supabase

```bash
# In your project root
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

## 🗄️ Step 2: Database Migration

### 2.1 Export Current SQL Server Schema

```bash
# From your backend directory
cd backend
dotnet ef migrations script --output migrations.sql
```

### 2.2 Convert to PostgreSQL

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Convert your Entity Framework migrations to PostgreSQL syntax
-- Key changes needed:
-- 1. UNIQUEIDENTIFIER → UUID
-- 2. NVARCHAR → TEXT or VARCHAR
-- 3. DATETIME2 → TIMESTAMP
-- 4. BIT → BOOLEAN
-- 5. Add proper constraints and indexes

-- Example conversion:
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserName" VARCHAR(256) NOT NULL,
    "Email" VARCHAR(256) NOT NULL,
    "PasswordHash" TEXT,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add your converted tables here...
```

### 2.3 Deploy Database Schema

```bash
# Push migrations to Supabase
supabase db push
```

## ⚙️ Step 3: Backend Configuration

### 3.1 Install PostgreSQL Provider

```bash
cd backend
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Supabase
```

### 3.2 Update Connection String

Update `appsettings.json` and `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=db.YOUR_PROJECT_REF.supabase.co;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;Port=5432;Pooling=true;SSL Mode=Require;"
  },
  "Supabase": {
    "Url": "https://YOUR_PROJECT_REF.supabase.co",
    "Key": "YOUR_ANON_KEY"
  }
}
```

### 3.3 Update DbContext

```csharp
// In your DbContext configuration
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    if (!optionsBuilder.IsConfigured)
    {
        optionsBuilder.UseNpgsql(connectionString);
    }
}
```

### 3.4 Add Supabase Services

```csharp
// In Program.cs or Startup.cs
services.AddScoped<Supabase.Client>(provider => 
    new Supabase.Client(
        configuration["Supabase:Url"], 
        configuration["Supabase:Key"],
        new SupabaseOptions
        {
            AutoConnectRealtime = true
        }));
```

## 🎨 Step 4: Frontend Configuration

### 4.1 Install Supabase Client

```bash
cd frontend
npm install @supabase/supabase-js
```

### 4.2 Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.3 Environment Variables

Create `.env.local`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_API_BASE_URL=https://your-backend-url.fly.dev
```

### 4.4 Update Authentication

Replace JWT auth with Supabase Auth:

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

## 🚀 Step 5: Deploy Frontend to Vercel

### 5.1 Prepare for Deployment

```bash
cd frontend
npm run build
```

### 5.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or connect GitHub repo for automatic deployments
```

### 5.3 Configure Environment Variables in Vercel

In Vercel dashboard, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

## 🔧 Step 6: Configure Supabase Features

### 6.1 Authentication Setup

In Supabase Dashboard → Authentication → Settings:

```json
{
  "site_url": "https://your-frontend-domain.vercel.app",
  "redirect_urls": [
    "https://your-frontend-domain.vercel.app/**",
    "http://localhost:5173/**"
  ]
}
```

### 6.2 Storage Setup

Create storage buckets:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('service-images', 'service-images', true),
  ('documents', 'documents', false);
```

### 6.3 Row Level Security (RLS)

```sql
-- Enable RLS on your tables
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON "Users"
  FOR SELECT USING (auth.uid() = "Id");

CREATE POLICY "Users can update own profile" ON "Users"
  FOR UPDATE USING (auth.uid() = "Id");
```

## 🔄 Step 7: Update API Integration

### 7.1 Add Supabase Auth to API Calls

```typescript
// src/lib/api.ts
import { supabase } from './supabase'

export async function apiCall(endpoint: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      'Authorization': `Bearer ${session.access_token}`
    }),
    ...options?.headers,
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  return response
}
```

### 7.2 Integrate Real-time Features

```typescript
// src/hooks/useRealtimeServices.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeServices() {
  const [services, setServices] = useState([])

  useEffect(() => {
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('services')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Services' },
        (payload) => {
          // Handle real-time updates
          console.log('Change received!', payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return services
}
```

## 📦 Step 8: Backend Deployment Options

### Option A: Keep Current Fly.io Setup

```bash
# Update fly.toml with new environment variables
[env]
  ConnectionStrings__Default = "Host=db.YOUR_PROJECT_REF.supabase.co;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;Port=5432;Pooling=true;SSL Mode=Require;"
  Supabase__Url = "https://YOUR_PROJECT_REF.supabase.co"
  Supabase__Key = "YOUR_ANON_KEY"

# Deploy
fly deploy
```

### Option B: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

### Option C: Deploy to Azure Container Instances

```dockerfile
# Use existing Dockerfile with environment variables
ENV ConnectionStrings__Default="Host=db.YOUR_PROJECT_REF.supabase.co;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;Port=5432;Pooling=true;SSL Mode=Require;"
ENV Supabase__Url="https://YOUR_PROJECT_REF.supabase.co"
ENV Supabase__Key="YOUR_ANON_KEY"
```

## 🧪 Step 9: Testing

### 9.1 Test Database Connection

```bash
# Test connection from backend
dotnet run --project src/HomeServicesApp.HttpApi.Host
```

### 9.2 Test Frontend Integration

```bash
cd frontend
npm run dev
```

### 9.3 Test Deployment

1. Visit your deployed frontend URL
2. Test authentication flow
3. Test API calls to backend
4. Test real-time features
5. Test file uploads to Supabase Storage

## 🔒 Step 10: Security Configuration

### 10.1 Configure CORS

In your ASP.NET Core backend:

```csharp
app.UseCors(builder =>
    builder
        .WithOrigins("https://your-frontend-domain.vercel.app")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
```

### 10.2 Update JWT Validation

Update to validate Supabase JWT tokens:

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://YOUR_PROJECT_REF.supabase.co/auth/v1";
        options.Audience = "authenticated";
    });
```

## 📊 Step 11: Monitoring & Analytics

### 11.1 Supabase Dashboard Monitoring

- Monitor database performance
- Track authentication metrics
- Monitor storage usage
- Review logs and errors

### 11.2 Application Monitoring

Consider adding:
- Sentry for error tracking
- Vercel Analytics for frontend metrics
- Custom logging for backend monitoring

## 🚀 Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database migrated to PostgreSQL
- [ ] Backend updated with Supabase connection
- [ ] Frontend configured with Supabase client
- [ ] Authentication migrated to Supabase Auth
- [ ] Storage configured for file uploads
- [ ] Real-time features implemented
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Fly.io/Railway/Azure)
- [ ] Environment variables configured
- [ ] CORS and security configured
- [ ] Testing completed
- [ ] Monitoring set up

## 🔄 Next Steps

1. **Performance Optimization**: Implement caching, optimize queries
2. **Advanced Features**: Add Edge Functions for serverless operations
3. **Scaling**: Configure auto-scaling for backend services
4. **Backup Strategy**: Set up database backups and disaster recovery
5. **CI/CD Pipeline**: Automate deployments with GitHub Actions

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [PostgreSQL Migration Guide](https://supabase.com/docs/guides/database/migrating-and-upgrading-projects)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)