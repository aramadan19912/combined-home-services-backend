#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Building Frontend Locally (No Registry Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /var/www/homeservices

# Step 1: Clean up any existing frontend containers
echo "🧹 Step 1: Cleaning up existing frontend containers..."
docker stop homeservices_frontend_1 2>/dev/null || true
docker rm -f homeservices_frontend_1 2>/dev/null || true
docker ps -a | grep frontend | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
echo "✅ Cleanup complete"
echo ""

# Step 2: Check if frontend directory exists
echo "📁 Step 2: Checking frontend directory..."
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    echo "Cloning repository..."
    git clone https://github.com/aramadan19912/combined-home-services-backend.git temp_clone
    mv temp_clone/frontend ./
    rm -rf temp_clone
fi
ls -la frontend/
echo ""

# Step 3: Build frontend image locally
echo "🔨 Step 3: Building frontend Docker image locally..."
cd frontend

# Create a production-ready Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    echo "Creating Dockerfile..."
    cat > Dockerfile << 'EOF'
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Set build args
ARG VITE_API_BASE_URL=http://72.60.234.126:8080/api
ARG VITE_API_HOST_URL=http://72.60.234.126:8080/api
ARG VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config if exists
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
fi

# Build the image
docker build -t homeservices_frontend:latest \
    --build-arg VITE_API_BASE_URL=http://72.60.234.126:8080/api \
    --build-arg VITE_API_HOST_URL=http://72.60.234.126:8080/api \
    --build-arg VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api \
    .

cd ..
echo "✅ Frontend image built"
echo ""

# Step 4: Run the frontend container
echo "🚀 Step 4: Starting frontend container..."
docker run -d \
    --name homeservices_frontend_1 \
    --restart unless-stopped \
    -p 3000:8080 \
    -e VITE_API_BASE_URL=http://72.60.234.126:8080/api \
    -e VITE_API_HOST_URL=http://72.60.234.126:8080/api \
    -e VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api \
    homeservices_frontend:latest

echo "✅ Frontend container started"
echo ""

# Step 5: Check container status
echo "📊 Step 5: Checking container status..."
docker ps | grep frontend
echo ""

# Step 6: Show logs
echo "📋 Step 6: Frontend logs..."
sleep 5
docker logs homeservices_frontend_1 --tail 30
echo ""

# Step 7: Test endpoints
echo "🧪 Step 7: Testing endpoints..."
sleep 5
curl -s -o /dev/null -w "Frontend (port 3000):      HTTP %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "API (port 8080):           HTTP %{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "Frontend (port 80):        HTTP %{http_code}\n" http://localhost/
curl -s -o /dev/null -w "API (port 80/api):         HTTP %{http_code}\n" http://localhost/api/
echo ""

# Step 8: Fix .env file issues
echo "🔧 Step 8: Fixing .env file issues..."
if [ -f ".env" ]; then
    echo "Backing up current .env..."
    cp .env .env.backup
    
    # Create a clean .env file
    cat > .env << 'EOF'
# Database Configuration
DB_NAME=HomeServices
DB_USER=sa
DB_PASSWORD=YourStrong@Password123

# Domain Configuration
DOMAIN_NAME=72.60.234.126

# API URLs
VITE_API_BASE_URL=http://72.60.234.126:8080/api
VITE_API_HOST_URL=http://72.60.234.126:8080/api
VITE_AUTH_API_BASE_URL=http://72.60.234.126:8080/api
EOF
    echo "✅ Created clean .env file"
fi
echo ""

# Step 9: Restart nginx to ensure it's working
echo "🔄 Step 9: Restarting nginx..."
systemctl restart nginx
echo "✅ Nginx restarted"
echo ""

# Step 10: Final test
echo "🧪 Step 10: Final test..."
sleep 3
echo "Testing from outside:"
curl -I http://72.60.234.126/ 2>&1 | head -10
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend built and running locally!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application at: http://72.60.234.126"
echo ""
echo "📝 Notes:"
echo "- Frontend is now built locally (no registry needed)"
echo "- Running on port 3000, proxied through nginx to port 80"
echo "- API endpoints configured to http://72.60.234.126:8080/api"
echo ""
echo "🔍 Check status:"
echo "- Docker images: docker images | grep frontend"
echo "- Running containers: docker ps"
echo "- Frontend logs: docker logs -f homeservices_frontend_1"
echo ""