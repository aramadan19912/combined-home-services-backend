# 🚀 Manual Deployment to Hostinger VPS

**Use this if CI/CD is failing or you want to deploy directly**

---

## ✅ Prerequisites

- VPS access: `ssh root@72.60.234.126`
- Docker installed on VPS
- Repository cloned at `/var/www/homeservices`

---

## 🎯 Quick Deploy (All-in-One Command)

**Copy and paste this entire block:**

```bash
cd /var/www/homeservices && \
git pull origin main && \
docker-compose down && \
docker-compose build --no-cache && \
docker-compose up -d && \
sleep 30 && \
docker ps && \
echo "Checking if Nginx is installed..." && \
which nginx || bash SETUP_NGINX_PROXY.sh && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "✅ DEPLOYMENT COMPLETE!" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "" && \
echo "🌐 Access your app:" && \
echo "   Frontend: http://72.60.234.126" && \
echo "   API:      http://72.60.234.126/api" && \
echo "   Swagger:  http://72.60.234.126/swagger" && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## 📋 Step-by-Step (If You Prefer)

### 1. SSH into VPS
```bash
ssh root@72.60.234.126
```

### 2. Go to app directory
```bash
cd /var/www/homeservices
```

### 3. Pull latest code
```bash
git pull origin main
```

### 4. Stop containers
```bash
docker-compose down
```

### 5. Rebuild all images
```bash
docker-compose build --no-cache
```

### 6. Start all services
```bash
docker-compose up -d
```

### 7. Wait and check status
```bash
sleep 30
docker ps
```

### 8. Setup Nginx (if not done yet)
```bash
bash SETUP_NGINX_PROXY.sh
```

---

## 🔍 Verify Deployment

### Check containers are running
```bash
docker ps
```

**You should see 3 containers with status "Up":**
- `homeservices-sqlserver`
- `homeservices_api_1`
- `homeservices_frontend_1`

### Check API logs
```bash
docker logs homeservices_api_1 --tail 50
```

**Should see:** `Starting HomeServicesApp.HttpApi.Host.`

### Test endpoints
```bash
curl http://localhost:8080/
curl http://localhost/swagger
curl http://localhost/
```

---

## 🌐 Access Your Application

- **Frontend:** http://72.60.234.126
- **Backend API:** http://72.60.234.126/api
- **Swagger UI:** http://72.60.234.126/swagger
- **SQL Server:** 72.60.234.126:1433

---

## 🔧 Troubleshooting

### Containers keep restarting?
```bash
docker logs homeservices_api_1 --tail 100
```

### API not responding?
```bash
docker exec -it homeservices_api_1 bash
curl http://localhost:8080/
```

### Database issues?
```bash
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES"
```

### Nginx not working?
```bash
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Full restart
```bash
docker-compose down
docker system prune -f
docker-compose up -d --build
```

---

## 🚀 Deploy New Changes

**Every time you push to GitHub, run on VPS:**

```bash
cd /var/www/homeservices
git pull origin main
docker-compose up -d --build
```

---

## ⚙️ Environment Variables

Configured in `docker-compose.yml`:

- `Database__Provider=SqlServer`
- `ConnectionStrings__Default=Server=sqlserver;...`
- `App__CorsOrigins=http://72.60.234.126`
- `VITE_API_BASE_URL=http://72.60.234.126/api`

---

## 📊 Database Management

### Connect with SSMS
- **Server:** 72.60.234.126,1433
- **Login:** SA
- **Password:** YourStrong@Password123
- **Database:** HomeServices

### View tables
```bash
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -d HomeServices -Q "SELECT name FROM sys.tables ORDER BY name"
```

---

## ✅ Success Checklist

- [ ] `docker ps` shows 3 containers running
- [ ] API logs show no errors
- [ ] Database has 45+ tables
- [ ] http://72.60.234.126/swagger loads
- [ ] Frontend loads at http://72.60.234.126
- [ ] Can make API calls

---

**Manual deployment is simpler than CI/CD for now!** 🎉
