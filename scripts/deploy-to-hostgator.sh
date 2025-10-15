#!/bin/bash

# HostGator Deployment Script
# This script handles deployment to HostGator hosting

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_METHOD="${DEPLOYMENT_METHOD:-ftp}" # ftp, ssh, or cpanel
BACKUP_ENABLED="${BACKUP_ENABLED:-true}"
MAX_BACKUPS="${MAX_BACKUPS:-5}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check required environment variables based on deployment method
check_env_vars() {
    case $DEPLOYMENT_METHOD in
        ftp)
            required_vars="HOSTGATOR_FTP_HOST HOSTGATOR_FTP_USERNAME HOSTGATOR_FTP_PASSWORD"
            ;;
        ssh)
            required_vars="HOSTGATOR_SSH_HOST HOSTGATOR_SSH_USER HOSTGATOR_SSH_KEY_PATH HOSTGATOR_DEPLOY_PATH"
            ;;
        cpanel)
            required_vars="HOSTGATOR_CPANEL_HOST HOSTGATOR_CPANEL_USERNAME HOSTGATOR_CPANEL_TOKEN"
            ;;
        *)
            print_error "Invalid deployment method: $DEPLOYMENT_METHOD"
            exit 1
            ;;
    esac

    for var in $required_vars; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Build the application
build_application() {
    print_status "Building application..."

    # Build backend
    if [ -d "backend" ]; then
        print_status "Building backend..."
        cd backend
        dotnet restore
        dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj \
            -c Release -o ./publish \
            -p:PublishSingleFile=false \
            -p:PublishTrimmed=false
        cd ..
    fi

    # Build frontend
    if [ -d "frontend" ]; then
        print_status "Building frontend..."
        cd frontend
        npm ci
        npm run build
        cd ..
    fi

    print_status "Build completed successfully"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."

    # Create temporary deployment directory
    DEPLOY_DIR="deployment_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $DEPLOY_DIR/backend
    mkdir -p $DEPLOY_DIR/frontend

    # Copy backend files
    if [ -d "backend/publish" ]; then
        cp -r backend/publish/* $DEPLOY_DIR/backend/
        
        # Copy additional backend files if they exist
        [ -f "backend/entrypoint.sh" ] && cp backend/entrypoint.sh $DEPLOY_DIR/backend/
        [ -f "backend/run-migrations.sh" ] && cp backend/run-migrations.sh $DEPLOY_DIR/backend/
    fi

    # Copy frontend files
    if [ -d "frontend/dist" ]; then
        cp -r frontend/dist/* $DEPLOY_DIR/frontend/
        [ -f "frontend/nginx.conf" ] && cp frontend/nginx.conf $DEPLOY_DIR/frontend/
    fi

    # Create .htaccess for HostGator
    cat > $DEPLOY_DIR/.htaccess << 'EOF'
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Frontend routing
RewriteCond %{REQUEST_URI} !^/api
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /frontend/index.html [L]

# API routing (if using local .NET Core hosting)
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:5000/$1 [P,L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
EOF

    # Create deployment info
    cat > $DEPLOY_DIR/DEPLOYMENT_INFO.txt << EOF
Deployment Information
=====================
Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")
Deployment Method: $DEPLOYMENT_METHOD
EOF

    # Create archive
    tar -czf deployment.tar.gz $DEPLOY_DIR/
    rm -rf $DEPLOY_DIR

    print_status "Deployment package created: deployment.tar.gz"
}

# Deploy via FTP
deploy_ftp() {
    print_status "Deploying via FTP to HostGator..."

    # Extract deployment package
    tar -xzf deployment.tar.gz

    # Create FTP script
    cat > ftp_deploy.txt << EOF
open $HOSTGATOR_FTP_HOST ${HOSTGATOR_FTP_PORT:-21}
user $HOSTGATOR_FTP_USERNAME $HOSTGATOR_FTP_PASSWORD
binary
passive
lcd deployment_*
cd ${HOSTGATOR_FTP_REMOTE_DIR:-/public_html}
mput -r *
quit
EOF

    # Execute FTP deployment
    ftp -inv < ftp_deploy.txt

    # Cleanup
    rm -f ftp_deploy.txt
    rm -rf deployment_*

    print_status "FTP deployment completed"
}

# Deploy via SSH
deploy_ssh() {
    print_status "Deploying via SSH to HostGator..."

    # Upload deployment package
    scp -i "$HOSTGATOR_SSH_KEY_PATH" -P "${HOSTGATOR_SSH_PORT:-22}" \
        deployment.tar.gz \
        "$HOSTGATOR_SSH_USER@$HOSTGATOR_SSH_HOST:~/"

    # Execute deployment on server
    ssh -i "$HOSTGATOR_SSH_KEY_PATH" -p "${HOSTGATOR_SSH_PORT:-22}" \
        "$HOSTGATOR_SSH_USER@$HOSTGATOR_SSH_HOST" << 'ENDSSH'
        set -e
        
        # Backup current deployment if exists
        if [ -d "$HOSTGATOR_DEPLOY_PATH" ] && [ "$BACKUP_ENABLED" = "true" ]; then
            backup_name="${HOSTGATOR_DEPLOY_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
            cp -r "$HOSTGATOR_DEPLOY_PATH" "$backup_name"
            echo "Created backup: $backup_name"
            
            # Remove old backups
            backup_count=$(ls -d ${HOSTGATOR_DEPLOY_PATH}.backup.* 2>/dev/null | wc -l)
            if [ $backup_count -gt $MAX_BACKUPS ]; then
                ls -dt ${HOSTGATOR_DEPLOY_PATH}.backup.* | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -rf
            fi
        fi
        
        # Extract new deployment
        tar -xzf deployment.tar.gz
        
        # Move to deployment path
        rm -rf "$HOSTGATOR_DEPLOY_PATH"
        mv deployment_* "$HOSTGATOR_DEPLOY_PATH"
        
        # Set permissions
        find "$HOSTGATOR_DEPLOY_PATH" -type d -exec chmod 755 {} \;
        find "$HOSTGATOR_DEPLOY_PATH" -type f -exec chmod 644 {} \;
        [ -f "$HOSTGATOR_DEPLOY_PATH/backend/entrypoint.sh" ] && chmod +x "$HOSTGATOR_DEPLOY_PATH/backend/entrypoint.sh"
        
        # Setup backend service if systemd is available
        if command -v systemctl &> /dev/null && [ -n "$HOSTGATOR_BACKEND_PORT" ]; then
            # Create systemd service
            sudo tee /etc/systemd/system/homeservices-api.service > /dev/null << EOF
[Unit]
Description=Home Services API
After=network.target

[Service]
WorkingDirectory=$HOSTGATOR_DEPLOY_PATH/backend
ExecStart=/usr/bin/dotnet $HOSTGATOR_DEPLOY_PATH/backend/HomeServicesApp.HttpApi.Host.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=homeservices-api
User=$HOSTGATOR_SSH_USER
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:${HOSTGATOR_BACKEND_PORT:-5000}

[Install]
WantedBy=multi-user.target
EOF
            
            sudo systemctl daemon-reload
            sudo systemctl enable homeservices-api
            sudo systemctl restart homeservices-api
        else
            # Use screen or nohup as fallback
            pkill -f "HomeServicesApp.HttpApi.Host.dll" || true
            cd "$HOSTGATOR_DEPLOY_PATH/backend"
            nohup dotnet HomeServicesApp.HttpApi.Host.dll > ~/homeservices-api.log 2>&1 &
        fi
        
        # Cleanup
        rm -f ~/deployment.tar.gz
        
        echo "Deployment completed successfully!"
ENDSSH

    print_status "SSH deployment completed"
}

# Deploy via cPanel API
deploy_cpanel() {
    print_status "Deploying via cPanel API to HostGator..."

    # This is a simplified example - actual cPanel API deployment would be more complex
    # and might require additional tools or scripts

    API_URL="https://$HOSTGATOR_CPANEL_HOST:2083/execute"
    AUTH_HEADER="Authorization: cpanel $HOSTGATOR_CPANEL_USERNAME:$HOSTGATOR_CPANEL_TOKEN"

    # Extract deployment package locally
    tar -xzf deployment.tar.gz

    # Upload files via cPanel File Manager API
    # Note: This is a simplified example. Real implementation would need to handle
    # file uploads properly, possibly using FTP as a fallback

    print_warning "cPanel API deployment is partially implemented. Consider using FTP or SSH methods."

    # Cleanup
    rm -rf deployment_*
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    case $DEPLOYMENT_METHOD in
        ssh)
            ssh -i "$HOSTGATOR_SSH_KEY_PATH" -p "${HOSTGATOR_SSH_PORT:-22}" \
                "$HOSTGATOR_SSH_USER@$HOSTGATOR_SSH_HOST" << 'ENDSSH'
                cd $HOSTGATOR_DEPLOY_PATH/backend
                dotnet HomeServicesApp.HttpApi.Host.dll --migrate
ENDSSH
            ;;
        *)
            print_warning "Database migrations can only be run with SSH deployment method"
            ;;
    esac
}

# Health check
health_check() {
    print_status "Running health check..."

    # Wait for services to start
    sleep 10

    # Check frontend
    frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "${HOSTGATOR_DOMAIN:-http://localhost}")
    if [ "$frontend_status" = "200" ]; then
        print_status "Frontend health check: OK (HTTP $frontend_status)"
    else
        print_warning "Frontend health check: Failed (HTTP $frontend_status)"
    fi

    # Check API
    api_status=$(curl -s -o /dev/null -w "%{http_code}" "${HOSTGATOR_DOMAIN:-http://localhost}/api/health")
    if [ "$api_status" = "200" ]; then
        print_status "API health check: OK (HTTP $api_status)"
    else
        print_warning "API health check: Failed (HTTP $api_status)"
    fi
}

# Main deployment flow
main() {
    print_status "Starting HostGator deployment..."
    print_status "Deployment method: $DEPLOYMENT_METHOD"

    # Check environment variables
    check_env_vars

    # Build application
    build_application

    # Create deployment package
    create_deployment_package

    # Deploy based on method
    case $DEPLOYMENT_METHOD in
        ftp)
            deploy_ftp
            ;;
        ssh)
            deploy_ssh
            ;;
        cpanel)
            deploy_cpanel
            ;;
    esac

    # Run migrations if enabled
    if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
        run_migrations
    fi

    # Run health check
    health_check

    # Cleanup
    rm -f deployment.tar.gz

    print_status "Deployment completed successfully!"
    print_status "Frontend URL: ${HOSTGATOR_DOMAIN}"
    print_status "API URL: ${HOSTGATOR_DOMAIN}/api"
}

# Run main function
main "$@"