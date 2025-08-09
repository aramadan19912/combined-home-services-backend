#!/bin/bash

echo "🚀 Home Services App - Free Deployment Setup"
echo "============================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit with deployment configuration"
    echo "✅ Git repository initialized"
    echo "📝 Next: Push to GitHub and follow the deployment guide"
    exit 1
fi

# Check if we have a remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No GitHub remote found."
    echo "📝 Please add your GitHub repository as origin:"
    echo "   git remote add origin https://github.com/yourusername/yourrepo.git"
    echo "   git push -u origin main"
    exit 1
fi

# Check if deployment files exist
echo "🔍 Checking deployment files..."

FILES=(
    "backend/Dockerfile"
    "backend/railway.json"
    "backend/src/HomeServicesApp.HttpApi.Host/appsettings.Production.json"
    "frontend/vercel.json"
    "frontend/.env.production"
    "DEPLOYMENT_GUIDE_FREE_HOSTING.md"
)

MISSING_FILES=()

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo "❌ Missing deployment files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo "📝 Please ensure all deployment files are created first."
    exit 1
fi

echo "✅ All deployment files found!"

# Add and commit deployment files
echo "📦 Adding deployment files to git..."
git add .
git status

echo ""
echo "🤔 Do you want to commit and push the deployment configuration? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    git commit -m "Add deployment configuration for Railway and Vercel

- Add Dockerfile for Railway deployment
- Add PostgreSQL support for production
- Configure Vercel for frontend deployment
- Add production environment configurations"
    
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "🎉 Deployment configuration pushed to GitHub!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open DEPLOYMENT_GUIDE_FREE_HOSTING.md"
    echo "2. Follow the step-by-step deployment guide"
    echo "3. Deploy backend to Railway"
    echo "4. Deploy frontend to Vercel"
    echo ""
    echo "🔗 Quick Links:"
    echo "- Railway: https://railway.app"
    echo "- Vercel: https://vercel.com"
    echo "- GitHub repo: $(git remote get-url origin)"
else
    echo "📝 Deployment files ready. Push manually when ready:"
    echo "   git commit -m 'Add deployment configuration'"
    echo "   git push origin main"
fi

echo ""
echo "🎯 Total Cost: $0 (Both platforms are completely free for your use case!)"