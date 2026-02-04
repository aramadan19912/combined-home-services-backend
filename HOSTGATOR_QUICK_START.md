# HostGator CI/CD Quick Start Guide 🚀

## 🎯 What This Does

This CI/CD setup automatically deploys your Home Services Platform to HostGator whenever you push to GitHub. It supports multiple deployment methods based on your HostGator hosting plan.

## 📋 Prerequisites

- GitHub repository with your code
- HostGator hosting account (Shared, VPS, or Dedicated)
- HostGator credentials or API token

## 🚀 Quick Setup (5 Minutes)

### Step 1: Choose Your Deployment Method

Based on your HostGator plan:

| Your Plan | Deployment Method | Required Info |
|-----------|------------------|---------------|
| Shared Hosting | FTP | FTP credentials |
| VPS/Dedicated | SSH | SSH access |
| Any with cPanel | cPanel API | API token |

### Step 2: Get Your Credentials

#### Option A: FTP (Most Common)

1. Log into HostGator cPanel
2. Go to **Files** → **FTP Accounts**
3. Note down:
   - FTP Server (e.g., `ftp.yourdomain.com`)
   - FTP Username
   - FTP Password

#### Option B: SSH (VPS/Dedicated)

1. Access your VPS/Dedicated server panel
2. Enable SSH if not already enabled
3. Generate SSH keys:
   ```bash
   ssh-keygen -t ed25519 -f hostgator_key
   ```

#### Option C: cPanel API Token

1. Log into cPanel
2. Go to **Security** → **Manage API Tokens**
3. Create new token named "GitHub-Deploy"
4. Copy the token immediately

### Step 3: Add GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

#### For FTP Deployment:
```
HOSTGATOR_FTP_HOST = ftp.yourdomain.com
HOSTGATOR_FTP_USERNAME = your-ftp-username
HOSTGATOR_FTP_PASSWORD = your-ftp-password
HOSTGATOR_DOMAIN = https://yourdomain.com
```

#### For SSH Deployment:
```
HOSTGATOR_SSH_HOST = your-server-ip
HOSTGATOR_SSH_USER = your-ssh-username
HOSTGATOR_SSH_PRIVATE_KEY = (paste entire private key)
HOSTGATOR_DEPLOY_PATH = /home/username/public_html
HOSTGATOR_DOMAIN = https://yourdomain.com
```

#### For cPanel API:
```
HOSTGATOR_CPANEL_HOST = yourdomain.com
HOSTGATOR_CPANEL_USERNAME = your-cpanel-username
HOSTGATOR_CPANEL_TOKEN = your-api-token
HOSTGATOR_DEPLOY_PATH = /home/username/public_html
HOSTGATOR_DOMAIN = https://yourdomain.com
```

### Step 4: Configure Database

1. In cPanel → **Databases** → **MySQL Databases**
2. Create database: `youruser_homeservices`
3. Create user: `youruser_hsapp`
4. Add user to database with ALL privileges
5. Add to GitHub Secrets:
   ```
   DB_NAME = youruser_homeservices
   DB_USER = youruser_hsapp
   DB_PASSWORD = your-secure-password
   ```

### Step 5: Deploy!

1. Push to your repository:
   ```bash
   git add .
   git commit -m "Setup HostGator CI/CD"
   git push origin main
   ```

2. Watch deployment:
   - Go to GitHub → **Actions** tab
   - Click on the running workflow
   - Monitor progress

## ✅ Verification

After deployment completes:

1. Visit your domain: `https://yourdomain.com`
2. Check API: `https://yourdomain.com/api/health`
3. If issues, check GitHub Actions logs

## 🔧 Configuration Options

### Environment Variables

Edit `.github/workflows/deploy-hostgator.yml` to customize:

```yaml
env:
  # Change deployment branch
  on:
    push:
      branches:
        - main  # Change to 'production' or any branch

  # Customize build settings
  VITE_API_BASE_URL: ${{ secrets.HOSTGATOR_DOMAIN }}/api
```

### Deployment Methods

In your workflow, the deployment method is auto-detected based on which secrets you provide:
- If `HOSTGATOR_FTP_HOST` is set → Uses FTP
- If `HOSTGATOR_SSH_HOST` is set → Uses SSH
- If `HOSTGATOR_CPANEL_TOKEN` is set → Uses cPanel API

## 📝 Manual Deployment Option

If you prefer manual deployment, use the provided script:

```bash
# Clone your repo
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo

# Set environment variables
export HOSTGATOR_FTP_HOST="ftp.yourdomain.com"
export HOSTGATOR_FTP_USERNAME="your-username"
export HOSTGATOR_FTP_PASSWORD="your-password"
export DEPLOYMENT_METHOD="ftp"

# Run deployment
./scripts/deploy-to-hostgator.sh
```

## 🛠️ Troubleshooting

### Common Issues

**FTP Connection Failed**
- Check FTP credentials in cPanel
- Ensure IP isn't blocked
- Try FTPS instead of FTP

**SSH Permission Denied**
- Verify SSH is enabled for your plan
- Check public key is added to server
- Test manually: `ssh -i key user@host`

**Build Failed**
- Check GitHub Actions logs
- Ensure all dependencies are committed
- Verify .NET and Node.js versions

**Site Not Loading**
- Check .htaccess file permissions
- Verify domain DNS settings
- Check error logs in cPanel

### Quick Fixes

1. **Reset deployment:**
   ```bash
   # Re-run workflow
   gh workflow run deploy-hostgator.yml
   ```

2. **Check logs:**
   - GitHub: Actions tab → Click workflow
   - HostGator: cPanel → Errors

3. **Test connection:**
   ```bash
   # Test FTP
   curl -u username:password ftp://hostname/

   # Test SSH
   ssh -i keyfile user@host echo "Connected!"
   ```

## 💡 Pro Tips

1. **Use SSH for VPS** - It's faster and more secure
2. **Enable caching** - Add cache headers in .htaccess
3. **Monitor resources** - Check cPanel metrics
4. **Regular backups** - Enable in deployment script

## 🔐 Security Notes

- Never commit credentials to your repo
- Use strong passwords for database
- Keep your HostGator account secure
- Regularly update dependencies

## 📞 Getting Help

1. **HostGator Support**: 24/7 chat/phone
2. **GitHub Actions**: Check workflow logs
3. **This Guide**: Review troubleshooting section

## 🎉 Success Checklist

- [ ] Credentials obtained from HostGator
- [ ] GitHub Secrets configured
- [ ] Database created and configured
- [ ] First deployment successful
- [ ] Site accessible at your domain

---

**Ready to deploy?** Push to your repo and watch the magic happen! 🚀

**Need the detailed guide?** Check `HOSTGATOR_SECRETS_SETUP.md` for comprehensive instructions.