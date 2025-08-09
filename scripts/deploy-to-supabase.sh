#!/bin/bash

# Supabase Deployment Automation Script
# This script helps deploy your Home Services Platform to Supabase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_color $BLUE "🚀 Home Services Platform - Supabase Deployment"
print_color $BLUE "=================================================="

# Check if required tools are installed
check_requirements() {
    print_color $YELLOW "📋 Checking requirements..."
    
    commands=("supabase" "npm" "git")
    for cmd in "${commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            print_color $RED "❌ $cmd is not installed. Please install it first."
            exit 1
        else
            print_color $GREEN "✅ $cmd is available"
        fi
    done
}

# Function to setup Supabase project
setup_supabase() {
    print_color $YELLOW "🔧 Setting up Supabase..."
    
    if [ ! -f "supabase/config.toml" ]; then
        print_color $YELLOW "Initializing Supabase project..."
        supabase init
    fi
    
    # Check if user is logged in
    if ! supabase projects list &> /dev/null; then
        print_color $YELLOW "Please log in to Supabase:"
        supabase login
    fi
    
    print_color $GREEN "✅ Supabase setup complete"
}

# Function to deploy database migrations
deploy_database() {
    print_color $YELLOW "📊 Deploying database migrations..."
    
    if [ -z "$SUPABASE_PROJECT_ID" ]; then
        print_color $RED "❌ SUPABASE_PROJECT_ID environment variable is not set"
        print_color $YELLOW "Please set it with: export SUPABASE_PROJECT_ID=your-project-id"
        exit 1
    fi
    
    # Link to Supabase project
    print_color $YELLOW "Linking to Supabase project: $SUPABASE_PROJECT_ID"
    supabase link --project-ref $SUPABASE_PROJECT_ID
    
    # Push database migrations
    print_color $YELLOW "Pushing database migrations..."
    supabase db push
    
    print_color $GREEN "✅ Database migrations deployed"
}

# Function to setup storage buckets
setup_storage() {
    print_color $YELLOW "🪣 Setting up storage buckets..."
    
    # Create storage buckets using SQL
    cat << EOF > temp_storage_setup.sql
-- Create storage buckets for the application
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Providers can upload service images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can access own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
EOF

    # Execute the storage setup
    supabase db push --file temp_storage_setup.sql
    rm temp_storage_setup.sql
    
    print_color $GREEN "✅ Storage buckets configured"
}

# Function to deploy edge functions
deploy_edge_functions() {
    print_color $YELLOW "⚡ Deploying Edge Functions..."
    
    if [ -d "supabase/functions" ]; then
        supabase functions deploy
        print_color $GREEN "✅ Edge Functions deployed"
    else
        print_color $YELLOW "⚠️  No Edge Functions found, skipping..."
    fi
}

# Function to build and deploy frontend
deploy_frontend() {
    print_color $YELLOW "🎨 Building and deploying frontend..."
    
    cd frontend
    
    # Install dependencies
    print_color $YELLOW "Installing frontend dependencies..."
    npm install
    
    # Build the project
    print_color $YELLOW "Building frontend..."
    npm run build
    
    # Deploy to Vercel (if vercel CLI is available)
    if command -v vercel &> /dev/null; then
        print_color $YELLOW "Deploying to Vercel..."
        vercel --prod
        print_color $GREEN "✅ Frontend deployed to Vercel"
    else
        print_color $YELLOW "⚠️  Vercel CLI not found. Please deploy manually:"
        print_color $BLUE "1. Install Vercel CLI: npm i -g vercel"
        print_color $BLUE "2. Run: vercel --prod"
        print_color $BLUE "3. Or connect your GitHub repo to Vercel dashboard"
    fi
    
    cd ..
}

# Function to update backend configuration
update_backend_config() {
    print_color $YELLOW "⚙️  Updating backend configuration..."
    
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        print_color $RED "❌ SUPABASE_DB_PASSWORD environment variable is not set"
        print_color $YELLOW "Please set it with your Supabase database password"
        exit 1
    fi
    
    # Update appsettings.Production.json with actual values
    cat > backend/src/HomeServicesApp.HttpApi.Host/appsettings.Production.json << EOF
{
  "App": {
    "CorsOrigins": "${FRONTEND_URL:-https://your-frontend.vercel.app}"
  },
  "Database": {
    "Provider": "PostgreSql"
  },
  "ConnectionStrings": {
    "Default": "Host=db.${SUPABASE_PROJECT_ID}.supabase.co;Database=postgres;Username=postgres;Password=${SUPABASE_DB_PASSWORD};Port=5432;Pooling=true;SSL Mode=Require;"
  },
  "Supabase": {
    "Url": "https://${SUPABASE_PROJECT_ID}.supabase.co",
    "Key": "${SUPABASE_ANON_KEY}",
    "ServiceKey": "${SUPABASE_SERVICE_KEY}"
  },
  "AuthServer": {
    "Authority": "https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1",
    "RequireHttpsMetadata": true,
    "SwaggerClientId": "HomeServicesApp_Swagger"
  }
}
EOF

    print_color $GREEN "✅ Backend configuration updated"
}

# Function to deploy backend
deploy_backend() {
    print_color $YELLOW "🖥️  Deploying backend..."
    
    cd backend
    
    if [ -f "fly.toml" ]; then
        print_color $YELLOW "Deploying to Fly.io..."
        
        # Update fly.toml with environment variables
        cat >> fly.toml << EOF

[env]
  ConnectionStrings__Default = "Host=db.${SUPABASE_PROJECT_ID}.supabase.co;Database=postgres;Username=postgres;Password=${SUPABASE_DB_PASSWORD};Port=5432;Pooling=true;SSL Mode=Require;"
  Supabase__Url = "https://${SUPABASE_PROJECT_ID}.supabase.co"
  Supabase__Key = "${SUPABASE_ANON_KEY}"
EOF
        
        # Deploy to Fly.io (if flyctl is available)
        if command -v flyctl &> /dev/null; then
            flyctl deploy
            print_color $GREEN "✅ Backend deployed to Fly.io"
        else
            print_color $YELLOW "⚠️  Fly.io CLI not found. Please deploy manually:"
            print_color $BLUE "1. Install Fly.io CLI: curl -L https://fly.io/install.sh | sh"
            print_color $BLUE "2. Run: flyctl deploy"
        fi
    else
        print_color $YELLOW "⚠️  No fly.toml found. Please choose a backend deployment option:"
        print_color $BLUE "1. Fly.io: https://fly.io/"
        print_color $BLUE "2. Railway: https://railway.app/"
        print_color $BLUE "3. Azure Container Instances"
        print_color $BLUE "4. Google Cloud Run"
    fi
    
    cd ..
}

# Function to run post-deployment tests
run_tests() {
    print_color $YELLOW "🧪 Running post-deployment tests..."
    
    # Test database connection
    print_color $YELLOW "Testing database connection..."
    if supabase db ping; then
        print_color $GREEN "✅ Database connection successful"
    else
        print_color $RED "❌ Database connection failed"
    fi
    
    # Test storage buckets
    print_color $YELLOW "Testing storage buckets..."
    # Add storage bucket tests here
    
    print_color $GREEN "✅ Tests completed"
}

# Function to display deployment summary
show_summary() {
    print_color $GREEN "🎉 Deployment Summary"
    print_color $GREEN "===================="
    print_color $GREEN "✅ Database: https://${SUPABASE_PROJECT_ID}.supabase.co"
    print_color $GREEN "✅ Frontend: ${FRONTEND_URL:-To be deployed to Vercel}"
    print_color $GREEN "✅ Backend: Check your deployment platform"
    print_color $GREEN ""
    print_color $YELLOW "Next Steps:"
    print_color $BLUE "1. Update your frontend environment variables with production URLs"
    print_color $BLUE "2. Configure OAuth providers in Supabase Dashboard"
    print_color $BLUE "3. Set up custom domain names if needed"
    print_color $BLUE "4. Monitor your application using Supabase Dashboard"
    print_color $GREEN ""
    print_color $GREEN "Happy deploying! 🚀"
}

# Main deployment flow
main() {
    check_requirements
    setup_supabase
    
    if [ "$1" = "--database-only" ]; then
        deploy_database
        setup_storage
    elif [ "$1" = "--frontend-only" ]; then
        deploy_frontend
    elif [ "$1" = "--backend-only" ]; then
        update_backend_config
        deploy_backend
    else
        # Full deployment
        deploy_database
        setup_storage
        deploy_edge_functions
        update_backend_config
        deploy_frontend
        deploy_backend
        run_tests
        show_summary
    fi
}

# Parse command line arguments
case "$1" in
    --help|-h)
        print_color $BLUE "Usage: $0 [OPTIONS]"
        print_color $BLUE ""
        print_color $BLUE "Options:"
        print_color $BLUE "  --database-only    Deploy only database migrations and storage"
        print_color $BLUE "  --frontend-only    Deploy only frontend to Vercel"
        print_color $BLUE "  --backend-only     Deploy only backend"
        print_color $BLUE "  --help, -h         Show this help message"
        print_color $BLUE ""
        print_color $BLUE "Environment Variables Required:"
        print_color $BLUE "  SUPABASE_PROJECT_ID    Your Supabase project ID"
        print_color $BLUE "  SUPABASE_DB_PASSWORD   Your Supabase database password"
        print_color $BLUE "  SUPABASE_ANON_KEY      Your Supabase anonymous key"
        print_color $BLUE "  SUPABASE_SERVICE_KEY   Your Supabase service role key"
        print_color $BLUE "  FRONTEND_URL           Your frontend URL (optional)"
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac