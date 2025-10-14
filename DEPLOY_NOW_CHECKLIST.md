# Deploy NOW - Complete Checklist 🚀

You bought your VPS! Let's get your app deployed in 30 minutes.

## 📧 Step 1: Get Your VPS Information

Check your **Hostinger email** for:
- [ ] **VPS IP Address** (e.g., `123.45.67.89`)
- [ ] **Root Password** (or SSH access details)
- [ ] **VPS Control Panel URL**

---

## 🔐 Step 2: First Login to VPS

Open terminal and connect:

```bash
ssh root@YOUR_VPS_IP
```

- [ ] Connected successfully
- [ ] Type `yes` when asked about fingerprint
- [ ] Enter password from email

**Change root password (recommended):**
```bash
passwd
```

---

## 🔧 Step 3: Update System & Run Setup

**Copy and paste these commands:**

```bash
# Update system
apt update && apt upgrade -y

# Download setup script
curl -o setup-vps.sh https://raw.githubusercontent.com/aramadan19912/combined-home-services-backend/main/scripts/setup-vps.sh

# Make it executable
chmod +x setup-vps.sh

# Run setup script
bash setup-vps.sh
```

**The script will ask you for:**

1. **Domain name:** 
   - If you have one: `yourdomain.com`
   - If not: Just press Enter or use VPS IP

2. **Email for SSL:**
   - Your email address

3. **Database password:**
   - Create a strong password (save it!)
   - Example: `MySecurePass123!`

4. **SSH public key:**
   - We'll generate this next (for now, press Enter to skip)

- [ ] Setup script completed
- [ ] Note down the database password you created

---

## 🔑 Step 4: Generate SSH Key for GitHub Actions

**On your LOCAL computer** (not VPS), open a NEW terminal:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy

# Press Enter for all prompts (no passphrase)
```

**Get your PUBLIC key:**
```bash
cat ~/.ssh/github_deploy.pub
```

**Add public key to VPS:**

Back in your VPS terminal:
```bash
# Create SSH directory if not exists
mkdir -p ~/.ssh

# Paste your public key here (replace with actual key)
echo "YOUR_PUBLIC_KEY_FROM_ABOVE" >> ~/.ssh/authorized_keys

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

- [ ] SSH key generated
- [ ] Public key added to VPS

---

## 🌐 Step 5: Get Domain (Optional)

**If you don't have a domain yet:**

Option A: **Buy from Namecheap** ($8.88/year)
- Go to https://namecheap.com
- Search for your domain
- Buy .com domain

Option B: **Use VPS IP for now**
- You can deploy without domain
- Add domain later

**If you have a domain, configure DNS:**

In your domain registrar (Namecheap, etc.):
1. Go to DNS Settings
2. Add A Record:
   - Host: `@`
   - Value: `YOUR_VPS_IP`
3. Add A Record:
   - Host: `www`
   - Value: `YOUR_VPS_IP`

- [ ] Domain configured (or skipped for now)

---

## 🔐 Step 6: Setup GitHub Secrets

Go to your GitHub repository:
```
https://github.com/aramadan19912/combined-home-services-backend/settings/secrets/actions
```

Click **"New repository secret"** and add each of these:

### Required Secrets:

**1. SSH_PRIVATE_KEY**
```bash
# On your local computer, copy private key:
cat ~/.ssh/github_deploy

# Copy EVERYTHING including BEGIN and END lines
```
- [ ] Added `SSH_PRIVATE_KEY`

**2. VPS_HOST**
```
Your VPS IP address (e.g., 123.45.67.89)
```
- [ ] Added `VPS_HOST`

**3. VPS_USER**
```
deployer
```
(or `root` if setup script created deployer user)
- [ ] Added `VPS_USER`

**4. DOMAIN_NAME**
```
yourdomain.com
```
(or your VPS IP if no domain)
- [ ] Added `DOMAIN_NAME`

**5. DB_NAME**
```
homeservices
```
- [ ] Added `DB_NAME`

**6. DB_USER**
```
homeservices_user
```
- [ ] Added `DB_USER`

**7. DB_PASSWORD**
```
The password you created in Step 3
```
- [ ] Added `DB_PASSWORD`

**8. VITE_API_BASE_URL**
```
https://yourdomain.com/api
```
(or `http://YOUR_VPS_IP/api` if no domain)
- [ ] Added `VITE_API_BASE_URL`

**9. VITE_AUTH_API_BASE_URL**
```
https://yourdomain.com/api
```
(or `http://YOUR_VPS_IP/api` if no domain)
- [ ] Added `VITE_AUTH_API_BASE_URL`

---

## 🚀 Step 7: Deploy!

### Option A: Trigger Deployment via Push

```bash
# On your local machine
git commit --allow-empty -m "Trigger deployment to Hostinger"
git push origin main
```

### Option B: Re-run GitHub Actions

1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. Click **"Re-run all jobs"**

- [ ] Deployment triggered
- [ ] Wait 5-8 minutes

---

## ✅ Step 8: Verify Deployment

### Check GitHub Actions:
1. Go to GitHub → Actions tab
2. Watch the deployment progress
3. Check all steps pass ✅

### Check Your Site:
Visit your application:
- [ ] **Frontend:** `https://yourdomain.com` (or `http://YOUR_VPS_IP`)
- [ ] **API:** `https://yourdomain.com/api` (or `http://YOUR_VPS_IP/api`)

### Test Login:
- [ ] Can register new account
- [ ] Can login
- [ ] Dashboard loads

---

## 🎉 Success!

If everything works:
- ✅ Your app is LIVE!
- ✅ CI/CD is configured
- ✅ Push to main = automatic deployment

---

## 🔧 Troubleshooting

### Deployment Failed?

**Check logs:**
```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Check backend service
sudo systemctl status homeservices-api

# View logs
sudo journalctl -u homeservices-api -n 50 --no-pager
```

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Restart services:**
```bash
sudo systemctl restart homeservices-api
sudo systemctl restart nginx
```

### Can't Access Website?

**Check firewall:**
```bash
sudo ufw status
```

Should show:
- 22/tcp (SSH)
- 80/tcp (HTTP)
- 443/tcp (HTTPS)

**Add rules if missing:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### GitHub Actions Fails?

**Common issues:**
1. SSH_PRIVATE_KEY not set correctly
2. VPS_HOST wrong IP
3. VPS_USER wrong username
4. Firewall blocking connection

**Check secrets:**
- Go to Settings → Secrets
- Verify all 9 secrets are set
- Check for typos

---

## 📊 What You Should See

### In GitHub Actions:
```
✓ Run Tests
✓ Build Frontend
✓ Build Backend
✓ Deploy to VPS
✓ Health Check
```

### On Your VPS:
```bash
# Services running
sudo systemctl status homeservices-api  # ✓ active (running)
sudo systemctl status nginx             # ✓ active (running)
sudo systemctl status postgresql        # ✓ active (running)
```

### In Browser:
- Frontend loads
- Can register/login
- API responds

---

## 🎯 Quick Reference

### SSH to VPS:
```bash
ssh root@YOUR_VPS_IP
```

### View Backend Logs:
```bash
sudo journalctl -u homeservices-api -f
```

### Restart Backend:
```bash
sudo systemctl restart homeservices-api
```

### Check Nginx Logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Manual Deployment:
```bash
./scripts/deploy-to-hostinger.sh
```

---

## ✅ Completion Checklist

- [ ] VPS purchased and set up
- [ ] Setup script ran successfully
- [ ] SSH key generated and added
- [ ] All 9 GitHub Secrets configured
- [ ] Deployment triggered
- [ ] Website accessible
- [ ] Can register and login
- [ ] CI/CD working (push = deploy)

---

## 🎉 You're Done!

Your Home Services Platform is now:
- ✅ Deployed on your VPS
- ✅ Accessible via domain or IP
- ✅ Auto-deploying on every push
- ✅ Running with CI/CD pipeline

**Next Steps:**
1. Share with users
2. Monitor performance
3. Add features
4. Scale as needed

---

## 💰 Monthly Costs

- VPS: $5-15/month
- Domain: $8.88/year (~$0.74/month)
- **Total: ~$6-16/month**

**Not bad for a full production app!** 🚀

---

## 📞 Need Help?

If stuck, check:
- `SSH_KEY_SETUP.md` - SSH key help
- `GITHUB_SECRETS_SETUP.md` - Secrets configuration
- `CICD_QUICK_START.md` - Full CI/CD guide
- GitHub Actions logs - Deployment details

---

**Congratulations!** 🎊 Your app is live!
