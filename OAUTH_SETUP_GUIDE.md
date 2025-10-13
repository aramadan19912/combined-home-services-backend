# OAuth & Authentication Setup Guide 🔐

Your Home Services Platform supports Google OAuth for social login. Here's how to set it up.

## 🎯 What You Need

### Required for Google Login:
- **Google Client ID**
- **Google Client Secret**

### Optional (for future):
- Facebook Client ID/Secret
- GitHub Client ID/Secret
- Twitter API credentials

---

## 🔧 Google OAuth Setup (Recommended)

### Step 1: Create Google Cloud Project

1. Go to **Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create a new project** or select existing one
   - Click "Select a project" → "New Project"
   - Name: "Home Services Platform"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Click "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth consent screen** (if first time)
   - User Type: **External**
   - Click "Create"
   
3. **Fill OAuth consent screen info:**
   ```
   App name: Home Services Platform
   User support email: your@email.com
   Developer contact: your@email.com
   ```
   - Click "Save and Continue"
   - Skip "Scopes" → "Save and Continue"
   - Add test users (your email) → "Save and Continue"

4. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: "Home Services App"
   
5. **Add Authorized redirect URIs:**
   ```
   https://yourdomain.com/signin-google
   https://www.yourdomain.com/signin-google
   http://localhost:44322/signin-google (for development)
   ```
   
6. **Click "Create"**
   - Copy your **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
   - Copy your **Client Secret** (looks like: `GOCSPX-abc123xyz`)
   - **Save these securely!**

---

## 📝 Configure Your Application

### Option A: Using Environment Variables (Recommended for Production)

Add to your GitHub Secrets:

```
GOOGLE_CLIENT_ID: your-client-id-here
GOOGLE_CLIENT_SECRET: your-client-secret-here
```

### Option B: Update Configuration Files (Development)

**File: `backend/src/HomeServicesApp.HttpApi.Host/appsettings.json`**

```json
{
  "Google": {
    "ClientId": "123456789-abc123.apps.googleusercontent.com",
    "ClientSecret": "GOCSPX-abc123xyz"
  }
}
```

**⚠️ Important:** Don't commit real credentials to Git!

---

## 🚀 Deploy with OAuth

### Update Your Deployment

1. **Add to GitHub Secrets:**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
   - Add:
     - `GOOGLE_CLIENT_ID`: Your Google Client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret

2. **Update deployment script** to use these secrets

3. **On your VPS**, create environment file:

```bash
# SSH to your VPS
ssh deployer@YOUR_VPS_IP

# Create environment file
sudo nano /var/www/homeservices/backend/publish/appsettings.Production.json
```

Add:
```json
{
  "Google": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID",
    "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
  },
  "App": {
    "CorsOrigins": "https://yourdomain.com,https://www.yourdomain.com"
  }
}
```

4. **Restart backend:**
```bash
sudo systemctl restart homeservices-api
```

---

## ✅ Test Google Login

1. **Go to your app:** `https://yourdomain.com`
2. **Click "Login with Google"**
3. **Authorize the app**
4. **You should be logged in!** ✨

---

## 🎯 Do You Need OAuth? (Optional)

### You Can Skip OAuth If:
- ✅ You only want email/password login (already working!)
- ✅ You're just testing the deployment
- ✅ You want to add it later

### Your app already has:
- ✅ Email/password authentication
- ✅ JWT tokens
- ✅ Role-based access control
- ✅ User registration

**Google OAuth is optional** - for convenience and faster signup.

---

## 🔐 Without OAuth Setup

If you **don't** want Google login right now:

### Option 1: Remove Google Auth (Quick)

**File: `backend/src/HomeServicesApp.HttpApi.Host/appsettings.json`**
```json
{
  "Google": {
    "ClientId": "",
    "ClientSecret": ""
  }
}
```

### Option 2: Hide Google Login Button (Frontend)

The frontend will automatically hide social login buttons if OAuth isn't configured.

### Option 3: Use Default Values

Your app will work fine without Google OAuth - users can still:
- ✅ Register with email/password
- ✅ Login with email/password
- ✅ Reset passwords
- ✅ Use all features

---

## 🌐 Production Configuration

### Full Production Setup

**File: `/var/www/homeservices/backend/publish/appsettings.Production.json`**

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Database=homeservices;Username=homeservices_user;Password=YOUR_DB_PASSWORD"
  },
  "App": {
    "CorsOrigins": "https://yourdomain.com,https://www.yourdomain.com",
    "SelfUrl": "https://yourdomain.com"
  },
  "AuthServer": {
    "Authority": "https://yourdomain.com",
    "RequireHttpsMetadata": true
  },
  "Google": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID",
    "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
  }
}
```

---

## 🔄 Other OAuth Providers (Future)

### Facebook Login

1. Go to https://developers.facebook.com/
2. Create App
3. Add Facebook Login
4. Get App ID and App Secret

Add to config:
```json
{
  "Facebook": {
    "AppId": "your-app-id",
    "AppSecret": "your-app-secret"
  }
}
```

### GitHub Login

1. Go to https://github.com/settings/developers
2. New OAuth App
3. Get Client ID and Client Secret

Add to config:
```json
{
  "GitHub": {
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret"
  }
}
```

---

## 🛠️ Current Authentication Methods

Your app currently supports:

### ✅ Already Working:
1. **Email/Password** - Built-in, no setup needed
2. **JWT Tokens** - Automatic
3. **Role-based Access** - Admin, Provider, Customer

### 🔧 Requires Setup:
1. **Google OAuth** - Need Client ID/Secret
2. **Facebook OAuth** - Optional
3. **GitHub OAuth** - Optional

---

## 💡 Quick Decision Guide

### Do I need to set up OAuth now?

**NO, if:**
- You just want to deploy and test
- Email/password login is enough
- You'll add it later

**YES, if:**
- You want "Login with Google" button
- You want faster user signup
- You're targeting non-technical users

---

## 🚀 Deployment Without OAuth

You can deploy **right now** without OAuth setup!

### Minimum Required for Deployment:

✅ **VPS** (Contabo) - You have this!
✅ **Domain** - Optional but recommended
✅ **Database password** - Will create during setup
✅ **GitHub Secrets** - Just VPS and domain info

**OAuth is NOT required** to deploy and use the app!

---

## 📋 Summary

### For Quick Deployment (No OAuth):
1. Skip OAuth setup
2. Deploy with basic auth (email/password)
3. Add OAuth later if needed

### For Full Features (With OAuth):
1. Get Google Client ID/Secret
2. Add to configuration
3. Deploy with social login

---

## ✅ My Recommendation for You

**Start without OAuth:**
1. ✅ Deploy to your Contabo VPS now
2. ✅ Use email/password authentication
3. ✅ Test everything works
4. 🔄 Add Google OAuth later (5 minutes)

This way you can:
- Get your app live quickly
- Test the deployment
- Add social login when ready

---

## 🎯 Next Steps

### To Deploy WITHOUT OAuth (Recommended):
1. Skip OAuth setup
2. Continue with Contabo VPS setup
3. Deploy your app
4. Users login with email/password

### To Deploy WITH OAuth:
1. Get Google Client ID/Secret (15 minutes)
2. Add to GitHub Secrets
3. Deploy to Contabo VPS
4. Users can login with Google

**Either way works!** Your app is ready to deploy. 🚀

---

## 📞 Need Help?

- **Google OAuth issues:** Check redirect URIs match exactly
- **Configuration problems:** Check appsettings.json syntax
- **Deployment issues:** OAuth won't block deployment

---

**You can deploy right now without OAuth!** ✨

It's completely optional. Your app has full authentication without it.
