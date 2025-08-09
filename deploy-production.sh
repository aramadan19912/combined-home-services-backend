#!/bin/bash

echo "🚀 Home Services App - Production Deployment Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if CLI tools are installed
print_info "Checking CLI tools..."

if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Installing..."
    npm install -g @railway/cli
    print_status "Railway CLI installed"
fi

if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_status "Vercel CLI installed"
fi

print_status "CLI tools are ready"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Git working directory is not clean. Committing changes..."
    git add .
    git commit -m "Deploy: Update configuration for production"
    git push origin main
    print_status "Changes committed and pushed"
fi

echo ""
echo "🚂 RAILWAY BACKEND DEPLOYMENT"
echo "=============================="

# Railway deployment
print_info "Starting Railway backend deployment..."

cd backend

# Check if already logged in to Railway
if ! railway whoami &> /dev/null; then
    print_warning "Not logged in to Railway. Please run:"
    echo "   railway login"
    echo ""
    echo "Visit: https://railway.app/cli-login"
    echo ""
    read -p "Press Enter after you've logged in to Railway..."
fi

# Create or connect to Railway project
print_info "Setting up Railway project..."

# Try to create a new project
if railway init; then
    print_status "Railway project initialized"
else
    print_warning "Project might already exist. Linking to existing project..."
    railway link
fi

# Add PostgreSQL service
print_info "Adding PostgreSQL database..."
railway add postgresql

# Set environment variables
print_info "Setting up environment variables..."

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -base64 48)

railway variables set ENCRYPTION_KEY="$ENCRYPTION_KEY"
railway variables set CORS_ORIGINS="http://localhost:3000"  # Will update after frontend deployment
railway variables set AUTH_SERVER_URL='${{RAILWAY_PUBLIC_DOMAIN}}'

print_status "Environment variables configured"

# Deploy backend
print_info "Deploying backend to Railway..."
railway up --detach

print_status "Backend deployment started"

# Get the deployment URL
RAILWAY_URL=$(railway domain)
if [ -z "$RAILWAY_URL" ]; then
    print_warning "Getting Railway URL..."
    sleep 10
    RAILWAY_URL=$(railway domain)
fi

print_status "Backend deployed to: $RAILWAY_URL"

cd ..

echo ""
echo "⚡ VERCEL FRONTEND DEPLOYMENT"
echo "============================="

# Vercel deployment
print_info "Starting Vercel frontend deployment..."

cd frontend

# Check if already logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please run:"
    echo "   vercel login"
    echo ""
    read -p "Press Enter after you've logged in to Vercel..."
fi

# Set environment variables for Vercel
print_info "Configuring frontend environment variables..."

if [ -n "$RAILWAY_URL" ]; then
    vercel env add VITE_API_BASE_URL production <<< "$RAILWAY_URL"
    vercel env add VITE_API_HOST_URL production <<< "${RAILWAY_URL}/api/v1"
    vercel env add VITE_AUTH_SERVER_URL production <<< "$RAILWAY_URL"
else
    print_warning "Railway URL not available. You'll need to set environment variables manually."
fi

vercel env add VITE_ENVIRONMENT production <<< "production"

# Deploy to Vercel
print_info "Deploying frontend to Vercel..."
vercel --prod

# Get Vercel URL
VERCEL_URL=$(vercel --prod --confirm | grep -o 'https://[^[:space:]]*\.vercel\.app')

print_status "Frontend deployed to: $VERCEL_URL"

cd ..

echo ""
echo "🔄 UPDATING CORS CONFIGURATION"
echo "==============================="

# Update CORS settings on Railway
if [ -n "$VERCEL_URL" ] && [ -n "$RAILWAY_URL" ]; then
    print_info "Updating CORS configuration..."
    cd backend
    railway variables set CORS_ORIGINS="${VERCEL_URL},http://localhost:3000"
    print_status "CORS configuration updated"
    cd ..
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
print_status "Your application is now live:"
echo ""
echo "🌐 Frontend: $VERCEL_URL"
echo "🔗 Backend:  $RAILWAY_URL"
echo "🗄️ Database: PostgreSQL on Railway"
echo ""
echo "📋 Next Steps:"
echo "1. Test the application by visiting the frontend URL"
echo "2. Check Railway logs for any backend issues"
echo "3. Monitor Vercel deployment logs"
echo "4. Set up custom domains if needed"
echo ""
echo "💰 Cost: $0 (Both platforms are free for your usage)"
echo ""
print_info "Deployment logs and monitoring:"
echo "- Railway: https://railway.app/dashboard"
echo "- Vercel:  https://vercel.com/dashboard"
echo ""
print_warning "If you encounter any issues:"
echo "1. Check the deployment logs on both platforms"
echo "2. Verify environment variables are set correctly"
echo "3. Ensure the database migrations ran successfully"
echo ""
echo "🏆 Happy deploying!"