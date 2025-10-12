# GitHub Secrets Setup Guide 🔐

## Required Secrets for CI/CD Pipeline

Your CI/CD pipeline needs 9 secrets to be configured in GitHub. Follow these steps:

## 📋 Step-by-Step Setup

### 1. Generate SSH Key (if you haven't already)

On your **local machine**:

```bash
# Generate a new SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deployer" -f ~/.ssh/hostinger_deploy

# This creates two files:
# - ~/.ssh/hostinger_deploy (private key) ← For GitHub Secret
# - ~/.ssh/hostinger_deploy.pub (public key) ← For VPS
```

### 2. Add Public Key to Your VPS

```bash
# Copy your public key
cat ~/.ssh/hostinger_deploy.pub

# SSH into your VPS
ssh root@YOUR_VPS_IP

# Add the public key to deployer user (if you've run setup-vps.sh)
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> /home/deployer/.ssh/authorized_keys

# OR if using root user temporarily:
mkdir -p ~/.ssh
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Configure GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** tab
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below:

---

## 🔑 Required Secrets

### 1. SSH_PRIVATE_KEY

**Value:** Content of your private SSH key

```bash
# On your local machine, copy the ENTIRE private key:
cat ~/.ssh/hostinger_deploy
```

Copy everything including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
... (all the key content) ...
-----END OPENSSH PRIVATE KEY-----
```

**Name in GitHub:** `SSH_PRIVATE_KEY`

---

### 2. VPS_HOST

**Value:** Your VPS IP address or hostname

Example: `123.45.67.89` or `vps.yourdomain.com`

**How to get it:**
- Check your Hostinger VPS dashboard
- Or SSH to your VPS and run: `hostname -I | awk '{print $1}'`

**Name in GitHub:** `VPS_HOST`

---

### 3. VPS_USER

**Value:** The SSH username for deployment

- If you ran `setup-vps.sh`: use `deployer`
- If using root: use `root` (not recommended for production)

**Name in GitHub:** `VPS_USER`

---

### 4. DOMAIN_NAME

**Value:** Your domain name without https://

Example: `example.com` or `myapp.example.com`

**Name in GitHub:** `DOMAIN_NAME`

---

### 5. DB_NAME

**Value:** PostgreSQL database name

Default from setup-vps.sh: `homeservices`

**Name in GitHub:** `DB_NAME`

---

### 6. DB_USER

**Value:** PostgreSQL database username

Default from setup-vps.sh: `homeservices_user`

**Name in GitHub:** `DB_USER`

---

### 7. DB_PASSWORD

**Value:** PostgreSQL database password

This is the password you set when running `setup-vps.sh`

**Important:** Keep this secure and strong!

**Name in GitHub:** `DB_PASSWORD`

---

### 8. VITE_API_BASE_URL

**Value:** Your API base URL

Format: `https://YOUR_DOMAIN/api`

Example: `https://example.com/api`

**Name in GitHub:** `VITE_API_BASE_URL`

---

### 9. VITE_AUTH_API_BASE_URL

**Value:** Your authentication API URL

Usually same as API base URL: `https://YOUR_DOMAIN/api`

Example: `https://example.com/api`

**Name in GitHub:** `VITE_AUTH_API_BASE_URL`

---

## ✅ Verification Checklist

Before running the pipeline, verify:

- [ ] SSH key pair generated
- [ ] Public key added to VPS (in `~/.ssh/authorized_keys`)
- [ ] Can SSH to VPS using: `ssh -i ~/.ssh/hostinger_deploy deployer@YOUR_VPS_IP`
- [ ] All 9 secrets added to GitHub
- [ ] Secret names match exactly (case-sensitive)
- [ ] VPS is set up and running
- [ ] Domain points to VPS IP

---

## 🧪 Test SSH Connection

Before pushing, test your SSH connection:

```bash
# Test SSH with your key
ssh -i ~/.ssh/hostinger_deploy deployer@YOUR_VPS_IP

# If successful, you should be logged into your VPS
# Type 'exit' to disconnect
```

---

## 🚀 Quick Setup Script

Here's a quick reference of what you need:

```bash
#!/bin/bash
# Quick reference for GitHub Secrets setup

echo "=== GitHub Secrets Configuration ==="
echo ""
echo "1. SSH_PRIVATE_KEY"
echo "   Copy this entire output:"
cat ~/.ssh/hostinger_deploy
echo ""
echo "2. VPS_HOST"
echo "   Your VPS IP: (check Hostinger dashboard)"
echo ""
echo "3. VPS_USER"
echo "   deployer"
echo ""
echo "4. DOMAIN_NAME"
echo "   Your domain (e.g., example.com)"
echo ""
echo "5. DB_NAME"
echo "   homeservices"
echo ""
echo "6. DB_USER"
echo "   homeservices_user"
echo ""
echo "7. DB_PASSWORD"
echo "   (The password you set during VPS setup)"
echo ""
echo "8. VITE_API_BASE_URL"
echo "   https://YOUR_DOMAIN/api"
echo ""
echo "9. VITE_AUTH_API_BASE_URL"
echo "   https://YOUR_DOMAIN/api"
```

---

## 🎯 After Adding Secrets

Once all secrets are configured:

1. Go to **Actions** tab in GitHub
2. Find the failed workflow run
3. Click **Re-run all jobs**

OR

Push a new commit:
```bash
git commit --allow-empty -m "Trigger deployment with configured secrets"
git push origin main
```

---

## 🔍 Troubleshooting

### Secret Not Found Error

**Error:** `The ssh-private-key argument is empty`

**Solution:**
1. Verify secret name is exactly: `SSH_PRIVATE_KEY` (case-sensitive)
2. Verify you pasted the ENTIRE private key including header/footer
3. Check in Settings → Secrets that the secret exists

### SSH Permission Denied

**Error:** `Permission denied (publickey)`

**Solution:**
1. Verify public key is in `/home/deployer/.ssh/authorized_keys` on VPS
2. Check permissions: `chmod 600 ~/.ssh/authorized_keys` on VPS
3. Test manually: `ssh -i ~/.ssh/hostinger_deploy deployer@YOUR_VPS_IP`

### Wrong Secret Value

**Solution:**
1. Go to repository Settings → Secrets
2. Find the secret
3. Click **Update**
4. Paste the correct value

---

## 📞 Need Help?

If you're still having issues:

1. **Check workflow logs**: Go to Actions tab → Click on failed run → View detailed logs
2. **Verify VPS access**: Try SSH manually from your local machine
3. **Double-check secrets**: Ensure no extra spaces or missing characters

---

## 🎉 Success!

Once all secrets are configured correctly, your CI/CD pipeline will:
- ✅ Automatically deploy on every push to main
- ✅ Run tests before deploying
- ✅ Create automatic backups
- ✅ Rollback on failures

**Happy deploying!** 🚀
