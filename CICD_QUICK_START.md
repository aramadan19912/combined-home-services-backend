# CI/CD Quick Start Guide 🚀

Get your Home Services Platform deployed to Hostinger with automated CI/CD in under 30 minutes!

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Hostinger VPS account
- [ ] GitHub repository with your code
- [ ] Domain name pointed to your VPS
- [ ] SSH access to your VPS
- [ ] Local terminal/command line access

## Step-by-Step Setup

### Step 1: Setup Your VPS (15 minutes)

```bash
# 1. SSH into your Hostinger VPS
ssh root@your-vps-ip

# 2. Upload and run the VPS setup script
# On your local machine:
scp scripts/setup-vps.sh root@your-vps-ip:/root/

# On your VPS:
bash /root/setup-vps.sh
```

This script will:
- ✅ Create deployment user
- ✅ Install .NET, Node.js, PostgreSQL, Nginx
- ✅ Configure firewall and services
- ✅ Setup SSL certificate
- ✅ Create application directories

**Save the output!** It contains important information for GitHub secrets.

### Step 2: Generate SSH Key for CI/CD (2 minutes)

On your **local machine**:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/hostinger_deploy

# Copy the public key
cat ~/.ssh/hostinger_deploy.pub

# Add it to your VPS (paste when prompted during setup-vps.sh)
# OR manually:
ssh root@your-vps-ip
echo "YOUR_PUBLIC_KEY_HERE" >> /home/deployer/.ssh/authorized_keys
```

Test the connection:
```bash
ssh -i ~/.ssh/hostinger_deploy deployer@your-vps-ip
```

### Step 3: Configure GitHub Secrets (5 minutes)

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets by clicking **New repository secret**:

#### Required Secrets:

| Secret Name | How to Get It | Example |
|------------|---------------|---------|
| `SSH_PRIVATE_KEY` | `cat ~/.ssh/hostinger_deploy` | Full private key content |
| `VPS_HOST` | Your VPS IP address | `123.45.67.89` |
| `VPS_USER` | Deployment username | `deployer` |
| `DOMAIN_NAME` | Your domain | `example.com` |
| `DB_NAME` | Database name | `homeservices` |
| `DB_USER` | Database user | `homeservices_user` |
| `DB_PASSWORD` | Password from setup | From setup-vps.sh output |
| `VITE_API_BASE_URL` | API URL | `https://example.com/api` |
| `VITE_AUTH_API_BASE_URL` | Auth API URL | `https://example.com/api` |

**Copy Private Key:**
```bash
# macOS:
cat ~/.ssh/hostinger_deploy | pbcopy

# Linux:
cat ~/.ssh/hostinger_deploy | xclip -selection clipboard

# Windows (Git Bash):
cat ~/.ssh/hostinger_deploy | clip
```

### Step 4: Push and Deploy! (5 minutes)

```bash
# Make sure workflow files are in your repository
git add .github/workflows/
git add scripts/
git add CICD_*.md

# Commit
git commit -m "Add CI/CD pipeline for Hostinger"

# Push to main branch (this triggers deployment!)
git push origin main
```

### Step 5: Monitor Deployment

1. Go to your GitHub repository
2. Click the **Actions** tab
3. Watch the deployment in real-time!

The pipeline will:
1. ✅ Run tests
2. ✅ Build frontend and backend
3. ✅ Deploy to your VPS
4. ✅ Run database migrations
5. ✅ Perform health checks

**Deployment takes ~5-8 minutes** ⏱️

### Step 6: Verify Deployment

Visit your application:
```
https://your-domain.com
```

Run health checks:
```bash
./scripts/health-check.sh
```

## What Happens on Each Push?

```
┌─────────────────────┐
│  Push to GitHub     │
│  (main branch)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Run Tests          │
│  - Backend tests    │
│  - Frontend build   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Build              │
│  - Compile backend  │
│  - Bundle frontend  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Deploy             │
│  - Upload via SSH   │
│  - Backup old       │
│  - Extract new      │
│  - Restart services │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Verify             │
│  - Health checks    │
│  - Notify status    │
└─────────────────────┘
```

## Troubleshooting

### Deployment Failed?

**Check logs:**
```bash
# GitHub Actions logs
# Go to Actions tab → Click on failed workflow → View logs

# VPS logs
ssh deployer@your-vps-ip
sudo journalctl -u homeservices-api -f
sudo tail -f /var/log/nginx/error.log
```

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "Permission denied" | Check SSH key is added correctly to VPS |
| "Host key verification failed" | Run: `ssh-keyscan -H your-vps-ip >> ~/.ssh/known_hosts` |
| Backend won't start | Check database connection string |
| 502 Bad Gateway | Backend service isn't running |

### Quick Fixes:

```bash
# Restart backend service
ssh deployer@your-vps-ip "sudo systemctl restart homeservices-api"

# Restart Nginx
ssh deployer@your-vps-ip "sudo systemctl restart nginx"

# Check service status
ssh deployer@your-vps-ip "sudo systemctl status homeservices-api"
```

## Manual Deployment (If CI/CD Fails)

```bash
# Use the manual deployment script
./scripts/deploy-to-hostinger.sh
```

## Rollback

If something goes wrong:

```bash
# Rollback to previous version
./scripts/rollback.sh

# Or rollback to specific backup
./scripts/rollback.sh 20241012_143022
```

## Advanced Features

### Deploy to Different Branches

Edit `.github/workflows/deploy-hostinger.yml`:

```yaml
on:
  push:
    branches:
      - main        # Production
      - staging     # Staging environment
```

### Manual Deployment Trigger

1. Go to **Actions** tab
2. Select **Deploy to Hostinger VPS**
3. Click **Run workflow**
4. Select branch
5. Click **Run workflow**

### View Real-time Logs

```bash
# On your VPS
ssh deployer@your-vps-ip

# Backend logs
sudo journalctl -u homeservices-api -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Useful Commands

```bash
# Health check
./scripts/health-check.sh

# Deploy manually
./scripts/deploy-to-hostinger.sh

# Rollback
./scripts/rollback.sh

# SSH to VPS
ssh -i ~/.ssh/hostinger_deploy deployer@your-vps-ip

# View GitHub Actions runs
gh run list

# View logs of latest run
gh run view --log

# Trigger deployment
gh workflow run deploy-hostinger.yml
```

## Maintenance

### Update Application

Just push to main branch:
```bash
git push origin main
```

### Database Backup

Automatic daily backups are configured at 2 AM.

Manual backup:
```bash
ssh deployer@your-vps-ip
pg_dump -U homeservices_user homeservices > backup.sql
```

### SSL Certificate Renewal

Automatic via Let's Encrypt certbot (configured during setup).

Check status:
```bash
ssh deployer@your-vps-ip
sudo certbot certificates
```

## Cost Breakdown

- **Hostinger VPS**: $5-15/month
- **Domain**: $10/year
- **SSL Certificate**: FREE (Let's Encrypt)
- **GitHub Actions**: FREE (2000 minutes/month)

**Total: ~$10-20/month** 💰

## Security Best Practices

- ✅ All secrets stored in GitHub Secrets (encrypted)
- ✅ SSH key authentication (no passwords)
- ✅ HTTPS enforced with SSL
- ✅ Firewall configured (UFW)
- ✅ Regular automated backups
- ✅ Limited sudo permissions for deployer user

## Next Steps

1. ✅ Setup complete? Test your deployment!
2. 📧 Configure email notifications for deployment failures
3. 📊 Setup monitoring (optional): Sentry, Application Insights
4. 🔄 Configure staging environment
5. 📝 Document your deployment process

## Support

Need help?

- 📖 Full guide: [CICD_SETUP_GUIDE.md](CICD_SETUP_GUIDE.md)
- 🏠 Hostinger docs: [HOSTINGER_DEPLOYMENT_GUIDE.md](HOSTINGER_DEPLOYMENT_GUIDE.md)
- 🐛 GitHub Issues: Create an issue in your repository
- 💬 Hostinger Support: 24/7 live chat

---

## Success! 🎉

Your CI/CD pipeline is now active. Every push to `main` will automatically deploy to your Hostinger VPS!

**Deployment URL:** `https://your-domain.com`

---

**Made with ❤️ for hassle-free deployments**
