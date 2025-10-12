# CI/CD Pipeline Setup for Hostinger Deployment 🚀

Complete guide to set up automated deployments to Hostinger VPS using GitHub Actions.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial VPS Setup](#initial-vps-setup)
4. [GitHub Repository Setup](#github-repository-setup)
5. [SSH Key Configuration](#ssh-key-configuration)
6. [GitHub Secrets Configuration](#github-secrets-configuration)
7. [Pipeline Features](#pipeline-features)
8. [Manual Deployment](#manual-deployment)
9. [Troubleshooting](#troubleshooting)

## Overview

This CI/CD pipeline automatically deploys your Home Services Platform to Hostinger VPS whenever you push to the `main` or `production` branch.

### Pipeline Flow

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Run Tests     │
│  - Backend      │
│  - Frontend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build          │
│  - Backend      │
│  - Frontend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to VPS  │
│  - Upload       │
│  - Extract      │
│  - Restart      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Health Check   │
│  - API status   │
│  - Frontend     │
└─────────────────┘
```

## Prerequisites

### What You Need

1. **Hostinger VPS** - Already set up and running
2. **GitHub Account** - With your repository
3. **Domain** - Pointed to your VPS
4. **SSH Access** - To your VPS

### Software on VPS

Make sure your VPS has these installed (from HOSTINGER_DEPLOYMENT_GUIDE.md):
- ✅ .NET 8.0 Runtime
- ✅ Node.js 18+
- ✅ PostgreSQL
- ✅ Nginx
- ✅ Application directory structure

## Initial VPS Setup

### 1. Create Application Directory

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Create directory structure
sudo mkdir -p /var/www/homeservices/{backend/publish,frontend/dist}
sudo chown -R www-data:www-data /var/www/homeservices
```

### 2. Create Deployment User (Recommended)

```bash
# Create deployment user
sudo adduser deployer
sudo usermod -aG sudo deployer

# Allow deployer to restart services without password
sudo visudo

# Add these lines at the end:
deployer ALL=(ALL) NOPASSWD: /bin/systemctl start homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl stop homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl restart homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
deployer ALL=(ALL) NOPASSWD: /bin/systemctl status homeservices-api
deployer ALL=(ALL) NOPASSWD: /bin/chown -R www-data\:www-data /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/cp -r /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/rm -rf /var/www/homeservices*
deployer ALL=(ALL) NOPASSWD: /bin/tar -xzf /tmp/*
deployer ALL=(ALL) NOPASSWD: /usr/bin/dotnet /var/www/homeservices*
```

### 3. Verify Services

```bash
# Check if backend service exists
sudo systemctl status homeservices-api

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

## SSH Key Configuration

### 1. Generate SSH Key Pair (On Your Local Machine)

```bash
# Generate a new SSH key for CI/CD
ssh-keygen -t ed25519 -C "github-actions-deployer" -f ~/.ssh/hostinger_deploy

# This creates:
# - ~/.ssh/hostinger_deploy (private key) - For GitHub Secrets
# - ~/.ssh/hostinger_deploy.pub (public key) - For VPS
```

### 2. Add Public Key to VPS

```bash
# Copy public key to clipboard
cat ~/.ssh/hostinger_deploy.pub

# SSH into your VPS
ssh root@your-vps-ip

# Add the public key to authorized_keys
sudo mkdir -p /home/deployer/.ssh
echo "your-public-key-content-here" | sudo tee -a /home/deployer/.ssh/authorized_keys
sudo chown -R deployer:deployer /home/deployer/.ssh
sudo chmod 700 /home/deployer/.ssh
sudo chmod 600 /home/deployer/.ssh/authorized_keys
```

### 3. Test SSH Connection

```bash
# From your local machine
ssh -i ~/.ssh/hostinger_deploy deployer@your-vps-ip

# If successful, you should be logged in without password
```

## GitHub Repository Setup

### 1. Add Workflow Files

The workflow files are already created in `.github/workflows/`:
- `deploy-hostinger.yml` - Standard deployment
- `deploy-hostinger-docker.yml` - Docker-based deployment (optional)

### 2. Commit and Push

```bash
git add .github/workflows/
git commit -m "Add CI/CD pipeline for Hostinger deployment"
git push origin main
```

## GitHub Secrets Configuration

### 1. Navigate to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2. Add Required Secrets

Add each of these secrets:

#### SSH and Server Configuration

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key content | Contents of `~/.ssh/hostinger_deploy` |
| `VPS_HOST` | VPS IP address or hostname | `123.45.67.89` |
| `VPS_USER` | SSH username | `deployer` |
| `DOMAIN_NAME` | Your domain name | `example.com` |

#### Database Configuration

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DB_NAME` | PostgreSQL database name | `homeservices` |
| `DB_USER` | Database user | `homeservices_user` |
| `DB_PASSWORD` | Database password | `your_secure_password_here` |

#### Frontend Environment

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL | `https://example.com/api` |
| `VITE_AUTH_API_BASE_URL` | Auth API URL | `https://example.com/api` |

### 3. How to Add SSH_PRIVATE_KEY

```bash
# On your local machine, copy the private key
cat ~/.ssh/hostinger_deploy | pbcopy  # macOS
# OR
cat ~/.ssh/hostinger_deploy | xclip -selection clipboard  # Linux
# OR
cat ~/.ssh/hostinger_deploy  # Windows - copy manually
```

Then paste the entire content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) into the GitHub secret.

## Pipeline Features

### Automatic Triggers

The pipeline runs automatically when you:
- Push to `main` branch
- Push to `production` branch

### Manual Trigger

You can also trigger manually:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to Hostinger VPS**
3. Click **Run workflow**

### Pipeline Stages

#### 1. Test Stage
```yaml
- Checkout code
- Setup .NET and Node.js
- Run backend tests
- Run frontend tests
- Build frontend
```

#### 2. Deploy Stage
```yaml
- Build frontend with production config
- Build backend
- Setup SSH connection
- Deploy backend to VPS
- Deploy frontend to VPS
- Run database migrations
- Health check
```

#### 3. Rollback (If Deployment Fails)
```yaml
- Restore previous backend version
- Restore previous frontend version
- Restart services
```

### Zero-Downtime Deployment

The pipeline implements zero-downtime deployment:

1. **Backup**: Creates backup of current version
2. **Stop**: Stops the service
3. **Replace**: Deploys new version
4. **Start**: Starts the service
5. **Verify**: Runs health checks
6. **Cleanup**: Removes old backups (keeps last 3)

## Manual Deployment

If you need to deploy manually:

### Option 1: Using the Deployment Script

```bash
# On your local machine
chmod +x scripts/deploy-to-hostinger.sh
./scripts/deploy-to-hostinger.sh
```

### Option 2: Direct SSH Commands

```bash
# SSH into VPS
ssh deployer@your-vps-ip

# Pull latest code
cd /var/www/homeservices
git pull origin main

# Deploy backend
cd backend
dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj \
  -c Release -o /var/www/homeservices/backend/publish
sudo systemctl restart homeservices-api

# Deploy frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/homeservices/frontend/dist/
sudo systemctl reload nginx
```

## Monitoring Deployments

### View Deployment Logs in GitHub

1. Go to **Actions** tab
2. Click on the latest workflow run
3. View logs for each step

### View Logs on VPS

```bash
# SSH into VPS
ssh deployer@your-vps-ip

# Backend logs
sudo journalctl -u homeservices-api -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker logs (if using Docker deployment)
cd /var/www/homeservices
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Deployment Fails with "Permission Denied"

**Solution**: Check SSH key and permissions

```bash
# On VPS
sudo chmod 700 /home/deployer/.ssh
sudo chmod 600 /home/deployer/.ssh/authorized_keys
sudo chown -R deployer:deployer /home/deployer/.ssh
```

### "Host key verification failed"

**Solution**: The pipeline should handle this, but if it persists:

```bash
# On your local machine
ssh-keyscan -H your-vps-ip >> ~/.ssh/known_hosts
```

### Backend Service Won't Start

**Solution**: Check service status and logs

```bash
# On VPS
sudo systemctl status homeservices-api
sudo journalctl -u homeservices-api -n 50 --no-pager

# Common issues:
# 1. Database connection - check connection string
# 2. Port already in use - check what's using port 5000
# 3. Missing dependencies - verify .NET installation
```

### Frontend Not Updating

**Solution**: Clear Nginx cache and verify files

```bash
# On VPS
sudo systemctl reload nginx
ls -la /var/www/homeservices/frontend/dist/

# Check Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
```

### Database Migration Fails

**Solution**: Run migrations manually

```bash
# On VPS
cd /var/www/homeservices/backend/publish
sudo -u www-data dotnet HomeServicesApp.HttpApi.Host.dll --migrate-database
```

### Rollback Not Working

**Solution**: Manual rollback

```bash
# On VPS
cd /var/www/homeservices/backend

# List available backups
ls -ltr publish.backup.*

# Restore specific backup
sudo systemctl stop homeservices-api
sudo rm -rf publish
sudo cp -r publish.backup.20231015_143022 publish
sudo systemctl start homeservices-api
```

### GitHub Actions Secrets Not Working

**Solution**: Verify secrets are set correctly

1. Check secret names match exactly (case-sensitive)
2. Re-add the secret if needed
3. Make sure there are no extra spaces or newlines

### Pipeline Runs But Nothing Deploys

**Solution**: Check branch name

```bash
# The pipeline only runs on 'main' or 'production' branches
git branch

# If on different branch, merge to main or create production branch
git checkout main
git merge your-branch
git push origin main
```

## Advanced Configuration

### Deploy to Different Environments

Create environment-specific branches:

```yaml
# In .github/workflows/deploy-hostinger.yml
on:
  push:
    branches:
      - main          # Production
      - staging       # Staging
      - develop       # Development
```

Then use environment-specific secrets in GitHub.

### Slack/Discord Notifications

Add notification step:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: Deployment to Hostinger ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Custom Health Checks

Add more health checks:

```yaml
- name: Extended health check
  run: |
    # Check API endpoints
    curl -f https://${{ secrets.DOMAIN_NAME }}/api/health
    curl -f https://${{ secrets.DOMAIN_NAME }}/api/service
    
    # Check frontend loads
    curl -f https://${{ secrets.DOMAIN_NAME }}
    
    # Check database connectivity
    ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} \
      "pg_isready -U ${{ secrets.DB_USER }} -d ${{ secrets.DB_NAME }}"
```

## Best Practices

1. **Always test locally first** before pushing to main
2. **Use staging environment** for testing deployments
3. **Monitor logs** after each deployment
4. **Keep backups** - the pipeline keeps last 3 automatically
5. **Use environment variables** - never commit secrets
6. **Tag releases** - use semantic versioning
7. **Document changes** - write clear commit messages

## Deployment Checklist

Before your first automated deployment:

- [ ] VPS is set up and running
- [ ] All services are configured (backend, Nginx, PostgreSQL)
- [ ] SSH key pair is generated
- [ ] Public key is added to VPS
- [ ] All GitHub secrets are configured
- [ ] Workflow files are committed
- [ ] Manual deployment tested successfully
- [ ] Database migrations work
- [ ] Health check endpoints respond
- [ ] Domain is pointed to VPS
- [ ] SSL certificate is configured

## Support

If you encounter issues:

1. Check the logs (GitHub Actions and VPS)
2. Review this troubleshooting section
3. Verify all secrets are configured correctly
4. Test SSH connection manually
5. Check VPS disk space and resources

---

## Quick Reference

### Essential Commands

```bash
# View deployment status
gh run list

# View logs of latest run
gh run view --log

# Trigger manual deployment
gh workflow run deploy-hostinger.yml

# SSH into VPS
ssh deployer@your-vps-ip

# Check service status
sudo systemctl status homeservices-api

# View application logs
sudo journalctl -u homeservices-api -f

# Restart services
sudo systemctl restart homeservices-api
sudo systemctl reload nginx
```

---

🚀 **You're all set!** Push to `main` branch and watch your application deploy automatically to Hostinger!
