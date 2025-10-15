# HostGator CI/CD Secrets Setup Guide 🔐

## Overview

This guide will help you configure GitHub Secrets for deploying your Home Services Platform to HostGator. HostGator supports multiple deployment methods, and you can choose the one that best fits your hosting plan.

## Deployment Methods

HostGator supports three deployment methods:
1. **FTP/FTPS** - Available on all HostGator plans
2. **SSH** - Available on VPS and Dedicated hosting plans
3. **cPanel API** - Available on plans with cPanel access

## Required Secrets by Deployment Method

### Option 1: FTP Deployment (Shared Hosting)

If you're using HostGator shared hosting, you'll use FTP deployment:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `HOSTGATOR_FTP_HOST` | FTP server hostname | `ftp.yourdomain.com` or `162.241.2.xxx` |
| `HOSTGATOR_FTP_USERNAME` | FTP username | `yourusername@yourdomain.com` |
| `HOSTGATOR_FTP_PASSWORD` | FTP password | Your FTP password |
| `HOSTGATOR_FTP_PORT` | FTP port (optional) | `21` (default) or `22` for SFTP |
| `HOSTGATOR_FTP_PROTOCOL` | Protocol type (optional) | `ftp` or `ftps` |
| `HOSTGATOR_FTP_REMOTE_DIR` | Remote directory | `/public_html/` or `/home/username/public_html/` |
| `HOSTGATOR_DOMAIN` | Your domain name | `https://yourdomain.com` |

### Option 2: SSH Deployment (VPS/Dedicated)

If you have HostGator VPS or Dedicated hosting with SSH access:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `HOSTGATOR_SSH_HOST` | SSH server hostname | `yourdomain.com` or `162.241.2.xxx` |
| `HOSTGATOR_SSH_USER` | SSH username | `root` or custom user |
| `HOSTGATOR_SSH_PRIVATE_KEY` | SSH private key | Your private key content |
| `HOSTGATOR_SSH_PORT` | SSH port (optional) | `22` (default) or custom port |
| `HOSTGATOR_DEPLOY_PATH` | Deployment directory | `/home/username/public_html` |
| `HOSTGATOR_BACKEND_PORT` | Backend API port | `5000` |
| `HOSTGATOR_DOMAIN` | Your domain name | `https://yourdomain.com` |

### Option 3: cPanel API Deployment

If you want to use HostGator's cPanel API with your API token:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `HOSTGATOR_CPANEL_HOST` | cPanel hostname | `yourdomain.com` or server hostname |
| `HOSTGATOR_CPANEL_USERNAME` | cPanel username | Your cPanel username |
| `HOSTGATOR_CPANEL_TOKEN` | cPanel API token | Your API token (see below) |
| `HOSTGATOR_DEPLOY_PATH` | Deployment directory | `/home/username/public_html` |
| `HOSTGATOR_DOMAIN` | Your domain name | `https://yourdomain.com` |

## Step-by-Step Setup

### Step 1: Get Your HostGator Credentials

#### For FTP:
1. Log in to your HostGator cPanel
2. Go to **Files** → **FTP Accounts**
3. Note your FTP server, username, and password
4. Or create a new FTP account specifically for deployments

#### For SSH:
1. Log in to your HostGator Customer Portal
2. Go to your VPS/Dedicated server management
3. Enable SSH access if not already enabled
4. Generate or upload SSH keys

#### For cPanel API Token:
1. Log in to your HostGator cPanel
2. Go to **Security** → **Manage API Tokens**
3. Click **Create** to generate a new API token
4. Give it a name like "GitHub-Deploy"
5. Copy the generated token immediately (you won't see it again)

### Step 2: Generate SSH Key (For SSH Deployment)

If using SSH deployment, generate a deployment key:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-hostgator-deploy" -f ~/.ssh/hostgator_deploy

# Display the private key (for GitHub secret)
cat ~/.ssh/hostgator_deploy

# Display the public key (for HostGator)
cat ~/.ssh/hostgator_deploy.pub
```

Add the public key to your HostGator VPS:
```bash
# SSH into your HostGator VPS
ssh username@your-hostgator-ip

# Add the public key
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the appropriate secrets based on your chosen deployment method

### Step 4: Database Configuration

Add these database-related secrets regardless of deployment method:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DB_CONNECTION_STRING` | Database connection string | See below |
| `DB_NAME` | Database name | `homeserv_prod` |
| `DB_USER` | Database username | `homeserv_user` |
| `DB_PASSWORD` | Database password | Your secure password |

#### HostGator Database Setup:

1. Log in to cPanel
2. Go to **Databases** → **MySQL Databases**
3. Create a new database (e.g., `homeserv_prod`)
4. Create a new user (e.g., `homeserv_user`)
5. Add user to database with ALL privileges

Your connection string format:
- **For MySQL**: `Server=localhost;Database=homeserv_prod;User=homeserv_user;Password=YourPassword`
- **For remote MySQL**: `Server=your-hostgator-server;Port=3306;Database=homeserv_prod;User=homeserv_user;Password=YourPassword`

## Quick Setup Scripts

### Script 1: Display Required Secrets (FTP)

```bash
#!/bin/bash
echo "=== HostGator FTP Deployment Secrets ==="
echo ""
echo "HOSTGATOR_FTP_HOST: (Check cPanel → FTP Accounts)"
echo "HOSTGATOR_FTP_USERNAME: (Your FTP username)"
echo "HOSTGATOR_FTP_PASSWORD: (Your FTP password)"
echo "HOSTGATOR_FTP_PORT: 21"
echo "HOSTGATOR_FTP_PROTOCOL: ftp"
echo "HOSTGATOR_FTP_REMOTE_DIR: /public_html/"
echo "HOSTGATOR_DOMAIN: https://yourdomain.com"
```

### Script 2: Test FTP Connection

```bash
#!/bin/bash
# Save as test-ftp-connection.sh

read -p "FTP Host: " FTP_HOST
read -p "FTP Username: " FTP_USER
read -s -p "FTP Password: " FTP_PASS
echo

# Test FTP connection
curl -u $FTP_USER:$FTP_PASS ftp://$FTP_HOST/ --list-only

if [ $? -eq 0 ]; then
    echo "✅ FTP connection successful!"
else
    echo "❌ FTP connection failed!"
fi
```

### Script 3: Test SSH Connection

```bash
#!/bin/bash
# Save as test-ssh-connection.sh

read -p "SSH Host: " SSH_HOST
read -p "SSH User: " SSH_USER
read -p "SSH Key Path [~/.ssh/hostgator_deploy]: " SSH_KEY
SSH_KEY=${SSH_KEY:-~/.ssh/hostgator_deploy}

# Test SSH connection
ssh -i $SSH_KEY -o ConnectTimeout=10 $SSH_USER@$SSH_HOST "echo '✅ SSH connection successful!'"
```

## Environment-Specific Configuration

### Frontend Environment Variables

These will be built into your frontend during CI/CD:

```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_API_HOST_URL=https://yourdomain.com/api
VITE_AUTH_API_BASE_URL=https://yourdomain.com/api
```

### Backend Configuration

The CI/CD will create appropriate `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=homeserv_prod;User=homeserv_user;Password=YourPassword"
  },
  "App": {
    "CorsOrigins": "https://yourdomain.com",
    "SelfUrl": "https://yourdomain.com"
  }
}
```

## Testing Your Configuration

### 1. Verify All Secrets Are Set

Go to your repository's Settings → Secrets and verify you have:

**For FTP deployment:**
- ✅ HOSTGATOR_FTP_HOST
- ✅ HOSTGATOR_FTP_USERNAME
- ✅ HOSTGATOR_FTP_PASSWORD
- ✅ HOSTGATOR_DOMAIN

**For SSH deployment:**
- ✅ HOSTGATOR_SSH_HOST
- ✅ HOSTGATOR_SSH_USER
- ✅ HOSTGATOR_SSH_PRIVATE_KEY
- ✅ HOSTGATOR_DEPLOY_PATH
- ✅ HOSTGATOR_DOMAIN

**For cPanel API:**
- ✅ HOSTGATOR_CPANEL_HOST
- ✅ HOSTGATOR_CPANEL_USERNAME
- ✅ HOSTGATOR_CPANEL_TOKEN
- ✅ HOSTGATOR_DEPLOY_PATH
- ✅ HOSTGATOR_DOMAIN

### 2. Trigger a Test Deployment

```bash
# Create a test commit
git commit --allow-empty -m "Test HostGator deployment"
git push origin main
```

### 3. Monitor the Deployment

1. Go to GitHub Actions tab
2. Watch the workflow progress
3. Check logs for any errors

## Troubleshooting

### Common Issues and Solutions

#### FTP Connection Failed
- Verify FTP credentials in cPanel
- Check if FTP is enabled for your account
- Try using FTPS (port 21) instead of FTP
- Ensure your IP isn't blocked by HostGator firewall

#### SSH Permission Denied
- Verify SSH is enabled for your hosting plan
- Check if public key is properly added to `~/.ssh/authorized_keys`
- Ensure correct file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Try connecting manually first: `ssh -i key_file user@host`

#### cPanel API Token Invalid
- Regenerate the API token in cPanel
- Ensure you're using the token, not your cPanel password
- Check token permissions in cPanel

#### Database Connection Failed
- Verify database exists in cPanel → MySQL Databases
- Check user has proper permissions
- Ensure using correct hostname (usually 'localhost' for HostGator)
- Test connection from cPanel's phpMyAdmin

## HostGator-Specific Notes

### 1. PHP Version
Ensure your HostGator account is using PHP 8.0+ for optimal compatibility:
- cPanel → Software → Select PHP Version

### 2. Resource Limits
Be aware of HostGator resource limits:
- **Shared Hosting**: Limited CPU, RAM, and process limits
- **VPS**: More resources but still has limits
- **Dedicated**: Full server resources

### 3. .htaccess Configuration
The deployment creates an `.htaccess` file for URL routing. Ensure:
- `mod_rewrite` is enabled (usually is on HostGator)
- No conflicting rules in parent directories

### 4. SSL Certificate
HostGator provides free SSL certificates:
- cPanel → Security → SSL/TLS Status
- Enable AutoSSL for your domain

## Security Best Practices

1. **Use Dedicated Deploy User**: Create a separate FTP/SSH user just for deployments
2. **Limit Directory Access**: Restrict deployment user to only necessary directories
3. **Rotate Credentials**: Regularly update passwords and API tokens
4. **Monitor Access Logs**: Check cPanel access logs for unusual activity
5. **Use FTPS/SFTP**: Always use encrypted connections when possible

## Quick Reference Checklist

Before deploying, ensure:

- [ ] HostGator hosting plan supports your chosen deployment method
- [ ] Domain is properly configured and pointing to HostGator
- [ ] SSL certificate is active
- [ ] Database is created and accessible
- [ ] All required GitHub secrets are configured
- [ ] Test deployment connection manually first
- [ ] Backend port is not blocked by firewall (for VPS/Dedicated)

## Getting Your HostGator Token

Since you mentioned you have a HostGator token, here's how to use it:

### If it's a cPanel API Token:
1. Add it as `HOSTGATOR_CPANEL_TOKEN` in GitHub Secrets
2. Also add your cPanel username as `HOSTGATOR_CPANEL_USERNAME`
3. The workflow will use it for API-based deployments

### If it's an OAuth/API Token:
Some HostGator services provide OAuth tokens. Contact HostGator support to clarify:
- What type of token you have
- What API endpoints it can access
- How to use it for deployments

## Support Resources

- **HostGator Support**: 24/7 chat and phone support
- **HostGator Knowledge Base**: support.hostgator.com
- **cPanel Documentation**: docs.cpanel.net
- **Community Forums**: forums.hostgator.com

---

🎉 **You're ready to deploy!** Once you've added the appropriate secrets, push to your main branch and watch the magic happen!