# 🌐 Setup Frontend on Port 80 (Default HTTP Port)

## Quick Setup Instructions

To make your frontend accessible on port 80 (http://72.60.234.126) instead of port 3000, you need to run the nginx setup script on your VPS server.

### Step 1: Connect to Your VPS

```bash
ssh root@72.60.234.126
```

### Step 2: Navigate to Application Directory

```bash
cd /var/www/homeservices
```

### Step 3: Pull Latest Changes

```bash
git pull origin main
```

### Step 4: Run the Nginx Setup Script

```bash
bash scripts/setup-nginx-port-80.sh
```

This script will:
- ✅ Install nginx (if not already installed)
- ✅ Configure nginx to proxy port 80 to your frontend on port 3000
- ✅ Set up routing for API and Swagger
- ✅ Configure firewall rules
- ✅ Test all endpoints

### Step 5: Verify It's Working

After the script completes, you should be able to access:

- **Frontend**: http://72.60.234.126 (no port needed!)
- **API**: http://72.60.234.126/api
- **Swagger**: http://72.60.234.126/swagger

## What This Does

The nginx setup creates a reverse proxy that:
1. Listens on port 80 (default HTTP port)
2. Forwards requests to your frontend running on port 3000
3. Handles API routing to port 8080
4. Manages WebSocket connections for real-time features

## Troubleshooting

If it's not working after setup:

1. **Check nginx status:**
   ```bash
   systemctl status nginx
   ```

2. **Check nginx error logs:**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. **Check if containers are running:**
   ```bash
   docker ps
   ```

4. **Test local connectivity:**
   ```bash
   curl http://localhost/
   ```

## Important Notes

- Your frontend container still runs on port 3000 internally
- Nginx acts as a reverse proxy from port 80 to port 3000
- This setup allows you to access the site without specifying a port
- The configuration is persistent and will survive container restarts

## Alternative: Quick Command

If you just want to run everything in one go:

```bash
ssh root@72.60.234.126 "cd /var/www/homeservices && git pull && bash scripts/setup-nginx-port-80.sh"
```

This will connect, update, and configure nginx all in one command!