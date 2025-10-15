#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Setting up Nginx Reverse Proxy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Install Nginx
echo "📦 Step 1: Installing Nginx..."
apt-get update
apt-get install -y nginx
systemctl enable nginx
echo "✅ Nginx installed"
echo ""

# Step 2: Create Nginx configuration
echo "⚙️ Step 2: Configuring Nginx..."
cat > /etc/nginx/sites-available/homeservices << 'NGINX_CONFIG'
server {
    listen 80;
    server_name 72.60.234.126;
    client_max_body_size 100M;

    # Frontend - serve from root
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Swagger UI
    location /swagger {
        proxy_pass http://localhost:8080/swagger;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONFIG

# Enable the site
ln -sf /etc/nginx/sites-available/homeservices /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "✅ Nginx configured"
echo ""

# Step 3: Test Nginx configuration
echo "🧪 Step 3: Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    exit 1
fi
echo ""

# Step 4: Restart Nginx
echo "🔄 Step 4: Restarting Nginx..."
systemctl restart nginx
systemctl status nginx --no-pager | head -10
echo "✅ Nginx restarted"
echo ""

# Step 5: Open firewall
echo "🔥 Step 5: Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw allow 1433/tcp
echo "✅ Firewall configured"
echo ""

# Step 6: Check if containers are running
echo "🐳 Step 6: Checking Docker containers..."
cd /var/www/homeservices
docker ps
echo ""

# Step 7: Test endpoints
echo "🧪 Step 7: Testing endpoints..."
sleep 5
curl -s -o /dev/null -w "Frontend (port 80):        HTTP %{http_code}\n" http://localhost/
curl -s -o /dev/null -w "API (port 80/api):         HTTP %{http_code}\n" http://localhost/api/
curl -s -o /dev/null -w "Swagger (port 80/swagger): HTTP %{http_code}\n" http://localhost/swagger/
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ NGINX SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://72.60.234.126"
echo "   API:      http://72.60.234.126/api"
echo "   Swagger:  http://72.60.234.126/swagger"
echo ""
echo "🔍 If not working, check:"
echo "   - Nginx logs: tail -f /var/log/nginx/error.log"
echo "   - Docker: docker ps"
echo "   - API logs: docker logs homeservices_api_1"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
