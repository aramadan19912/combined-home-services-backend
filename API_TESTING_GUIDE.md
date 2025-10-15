# 🧪 API Testing Guide - Hostinger Deployment

## 🌐 Your API Endpoints

### Swagger UI (API Documentation)
```
http://72.60.234.126:8080/swagger
```

### Base API URL
```
http://72.60.234.126:8080/api
```

---

## 🔍 Check If API Is Running

### On VPS (SSH into server):

```bash
ssh root@72.60.234.126

# Check Docker containers
docker ps

# Check backend logs
docker logs homeservices_api_1 --tail 50

# Check if port 8080 is open
netstat -tulpn | grep 8080
```

---

## 🧪 Test API Endpoints

### 1. Health Check
```bash
curl http://72.60.234.126:8080/api/health
```

### 2. Get API Info
```bash
curl http://72.60.234.126:8080/api/abp/application-configuration
```

### 3. Access Swagger
Open in browser:
```
http://72.60.234.126:8080/swagger
```

---

## 🔥 Common Issues & Fixes

### ❌ "Cannot reach Swagger"

**Cause:** Backend container not running or port 8080 blocked

**Fix:**
```bash
ssh root@72.60.234.126

# Check containers
docker ps -a

# If not running, start it
cd /var/www/homeservices
docker-compose up -d api

# Check logs
docker logs homeservices_api_1 --tail 100

# Open firewall
ufw allow 8080/tcp
```

---

### ❌ "Connection refused"

**Cause:** Backend crashed or SQL Server not ready

**Fix:**
```bash
# Check backend logs
docker logs homeservices_api_1 --tail 100

# Restart containers in order
docker-compose restart sqlserver
sleep 10
docker-compose restart api

# Check status
docker ps
```

---

### ❌ "502 Bad Gateway"

**Cause:** Backend starting up or migrations running

**Fix:** Wait 30 seconds and try again
```bash
# Watch logs
docker logs -f homeservices_api_1
```

---

## 📋 Available API Endpoints (from Swagger)

Once Swagger loads, you'll see:

### Authentication
- `POST /api/account/login`
- `POST /api/account/register`
- `POST /api/account/logout`

### Providers
- `GET /api/app/provider`
- `POST /api/app/provider`
- `PUT /api/app/provider/{id}`
- `DELETE /api/app/provider/{id}`
- `POST /api/app/provider/upload-id`

### Services
- `GET /api/app/service`
- `POST /api/app/service`
- `PUT /api/app/service/{id}`
- `DELETE /api/app/service/{id}`

### Orders
- `GET /api/app/order`
- `POST /api/app/order`
- `PUT /api/app/order/{id}`
- `GET /api/app/order/{id}`

### Reviews
- `GET /api/app/review`
- `POST /api/app/review`
- `PUT /api/app/review/{id}`

### Categories
- `GET /api/app/category`
- `POST /api/app/category`
- `PUT /api/app/category/{id}`
- `DELETE /api/app/category/{id}`

---

## 🚀 Quick Start Testing

### 1. Open Swagger
```
http://72.60.234.126:8080/swagger
```

### 2. Try a Simple GET Request
Click on: **GET /api/app/service**
- Click "Try it out"
- Click "Execute"
- See the response!

### 3. Login (to test authenticated endpoints)
Click on: **POST /api/account/login**
- Click "Try it out"
- Enter credentials:
  ```json
  {
    "userNameOrEmailAddress": "admin",
    "password": "1q2w3E*"
  }
  ```
- Click "Execute"
- Copy the `accessToken` from response

### 4. Authorize
- Click "Authorize" button (top right)
- Enter: `Bearer YOUR_ACCESS_TOKEN`
- Click "Authorize"
- Now you can test protected endpoints!

---

## ✅ Expected Response (Healthy API)

When you visit `http://72.60.234.126:8080/swagger`, you should see:

```
Home Services Platform API v1
Swagger UI
```

With all endpoints listed and expandable.

---

## 🆘 Still Not Working?

**Run the full diagnostic:**

```bash
ssh root@72.60.234.126

cd /var/www/homeservices

# Full status check
echo "=== DOCKER CONTAINERS ==="
docker ps -a

echo ""
echo "=== BACKEND LOGS ==="
docker logs homeservices_api_1 --tail 50

echo ""
echo "=== SQL SERVER STATUS ==="
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "SELECT @@VERSION"

echo ""
echo "=== PORT CHECK ==="
netstat -tulpn | grep -E "(8080|1433|3000)"

echo ""
echo "=== FIREWALL ==="
ufw status
```

Then share the output and I'll help debug! 🔧
