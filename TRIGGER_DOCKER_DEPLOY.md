# 🚀 Trigger Docker Deployment to Hostinger

## Current Status

✅ **Docker workflow is active** on main branch
✅ **Old standard workflow is disabled**
❌ Last deploy failed because old workflow ran

---

## ⚡ Quick Deploy Now

**Run this to trigger Docker deployment:**

```bash
git commit --allow-empty -m "Deploy with Docker to Hostinger"
git push origin main
```

Then watch at:
https://github.com/aramadan19912/combined-home-services-backend/actions

---

## 📋 What the Docker Workflow Does

1. **Build Docker Images**
   - Frontend (React + Vite)
   - Backend (.NET 9 + ABP Framework)

2. **Push to GitHub Container Registry**
   - `ghcr.io/aramadan19912/combined-home-services-backend/frontend:latest`
   - `ghcr.io/aramadan19912/combined-home-services-backend/backend:latest`

3. **Deploy to VPS**
   - Pull images on Hostinger VPS
   - Start SQL Server container
   - Run migrations
   - Start backend + frontend

4. **Access Your App**
   - Frontend: http://72.60.234.126:3000
   - Backend: http://72.60.234.126:8080/api
   - SQL Server: 72.60.234.126:1433

---

## 🔧 Before First Deploy

**Make sure VPS has Docker installed:**

```bash
ssh root@72.60.234.126

# Install Docker if needed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /var/www/homeservices
cd /var/www/homeservices

# Clone repo
git clone https://github.com/aramadan19912/combined-home-services-backend.git .
```

---

## 🎯 Then Trigger Deployment

```bash
git commit --allow-empty -m "Deploy to Hostinger"
git push origin main
```

**Done! Your app will deploy automatically!** 🎉
