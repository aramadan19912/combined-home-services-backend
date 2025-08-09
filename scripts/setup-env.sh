#!/bin/bash

# Environment Setup Script for Supabase Deployment
# This script helps you configure the required environment variables

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

print_color $BLUE "🔧 Environment Setup for Supabase Deployment"
print_color $BLUE "=============================================="

# Function to prompt for input with default
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        value=${value:-$default}
    else
        read -p "$prompt: " value
    fi
    
    export $var_name="$value"
    echo "export $var_name=\"$value\"" >> .env.deployment
}

# Function to prompt for secure input (passwords)
prompt_secure() {
    local prompt="$1"
    local var_name="$2"
    
    read -s -p "$prompt: " value
    echo
    export $var_name="$value"
    echo "export $var_name=\"$value\"" >> .env.deployment
}

print_color $YELLOW "This script will help you set up environment variables for deployment."
print_color $YELLOW "The variables will be saved to .env.deployment file."
print_color $YELLOW ""

# Check if .env.deployment exists
if [ -f ".env.deployment" ]; then
    print_color $YELLOW "Existing .env.deployment found. Do you want to:"
    print_color $BLUE "1. Update existing file"
    print_color $BLUE "2. Create new file (backup existing)"
    print_color $BLUE "3. Exit"
    read -p "Choose option [1-3]: " choice
    
    case $choice in
        1)
            print_color $YELLOW "Updating existing configuration..."
            ;;
        2)
            cp .env.deployment .env.deployment.backup
            print_color $YELLOW "Backed up existing file to .env.deployment.backup"
            > .env.deployment
            ;;
        3)
            print_color $BLUE "Exiting..."
            exit 0
            ;;
        *)
            print_color $RED "Invalid choice. Exiting..."
            exit 1
            ;;
    esac
else
    > .env.deployment
fi

print_color $GREEN "\n📝 Setting up Supabase configuration..."

# Supabase Project Setup
print_color $YELLOW "\n1. Supabase Project Configuration"
print_color $BLUE "   Get these values from: https://supabase.com/dashboard/project/[your-project]/settings/api"

prompt_input "Enter your Supabase Project ID" "" "SUPABASE_PROJECT_ID"
prompt_input "Enter your Supabase URL" "https://${SUPABASE_PROJECT_ID}.supabase.co" "SUPABASE_URL"
prompt_input "Enter your Supabase Anonymous Key" "" "SUPABASE_ANON_KEY"
prompt_input "Enter your Supabase Service Role Key" "" "SUPABASE_SERVICE_KEY"

# Database Configuration
print_color $YELLOW "\n2. Database Configuration"
print_color $BLUE "   Get the database password from: https://supabase.com/dashboard/project/[your-project]/settings/database"

prompt_secure "Enter your Supabase Database Password" "SUPABASE_DB_PASSWORD"

# Frontend Configuration
print_color $YELLOW "\n3. Frontend Configuration"
print_input "Enter your Frontend URL (after Vercel deployment)" "https://your-app.vercel.app" "FRONTEND_URL"

# Backend Configuration
print_color $YELLOW "\n4. Backend Configuration"
print_input "Enter your Backend URL (after deployment)" "https://your-backend.fly.dev" "BACKEND_URL"

# Additional Configuration
print_color $YELLOW "\n5. Additional Configuration (Optional)"
print_input "Enter your Google OAuth Client ID (optional)" "" "GOOGLE_CLIENT_ID"
print_input "Enter your Stripe Publishable Key (optional)" "" "STRIPE_PUBLISHABLE_KEY"
print_input "Enter your Sentry DSN (optional)" "" "SENTRY_DSN"

# Write additional exports
cat >> .env.deployment << 'EOF'

# Derived Environment Variables
export VITE_SUPABASE_URL="$SUPABASE_URL"
export VITE_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
export VITE_API_BASE_URL="$BACKEND_URL"
export VITE_APP_NAME="Home Services Platform"
export VITE_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
export VITE_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
export VITE_SENTRY_DSN="$SENTRY_DSN"

# Database Connection String
export DATABASE_URL="Host=db.$SUPABASE_PROJECT_ID.supabase.co;Database=postgres;Username=postgres;Password=$SUPABASE_DB_PASSWORD;Port=5432;Pooling=true;SSL Mode=Require;"
EOF

print_color $GREEN "\n✅ Environment configuration saved to .env.deployment"
print_color $YELLOW "\n📋 Next Steps:"
print_color $BLUE "1. Review the generated .env.deployment file"
print_color $BLUE "2. Source the environment variables: source .env.deployment"
print_color $BLUE "3. Run the deployment script: ./scripts/deploy-to-supabase.sh"
print_color $BLUE ""
print_color $YELLOW "To load these variables in your current session:"
print_color $GREEN "source .env.deployment"
print_color $YELLOW ""
print_color $YELLOW "To use these in your development environment:"
print_color $GREEN "cp .env.deployment frontend/.env.local"

# Create frontend .env files
print_color $YELLOW "\n🎨 Creating frontend environment files..."

# Create .env.local for development
cat > frontend/.env.local << EOF
# Local Development Environment
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_API_BASE_URL=https://localhost:44322
VITE_APP_NAME=Home Services Platform
EOF

# Create .env.production for production
cat > frontend/.env.production << EOF
# Production Environment
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_BASE_URL=${BACKEND_URL}
VITE_APP_NAME=Home Services Platform
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
VITE_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
VITE_SENTRY_DSN=${SENTRY_DSN}
EOF

print_color $GREEN "✅ Frontend environment files created:"
print_color $BLUE "   - frontend/.env.local (development)"
print_color $BLUE "   - frontend/.env.production (production)"

print_color $GREEN "\n🎉 Environment setup complete!"
print_color $YELLOW "Remember to keep your .env.deployment file secure and do not commit it to version control."