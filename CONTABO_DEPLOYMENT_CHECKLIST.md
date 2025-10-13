# Contabo Deployment Checklist ✅

Quick checklist to deploy your Home Services Platform to Contabo VPS.

## 📋 Before You Start

- [ ] Received Contabo email with VPS IP and password
- [ ] Have terminal/SSH client ready
- [ ] (Optional) Have domain name ready

---

## 🚀 Deployment Steps

### Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

- [ ] Connected successfully
- [ ] Changed root password: `passwd`

### Step 2: Update System

```bash
apt update && apt upgrade -y
```

- [ ] System updated (takes 2-5 minutes)

### Step 3: Download and Run Setup Script

```bash
curl -o setup-vps.sh https://raw.githubusercontent.com/aramadan19912/combined-home-services-backend/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
bash setup-vps.sh
```

When prompted, enter:
- [ ] Domain name (or just use your VPS IP for now)
- [ ] Email address (for SSL certificate)
- [ ] Database password (create a strong one - save it!)
- [ ] SSH public key (from your local machine)

### Step 4: Generate SSH Key (On Your Local Machine)

Open a NEW terminal on your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/contabo_deploy
```

Get your public key:
```bash
cat ~/.ssh/contabo_deploy.pub
```

- [ ] SSH key generated
- [ ] Public key copied

Paste this public key when the VPS setup script asks for it.

### Step 5: Buy Domain (Optional)

If you don't have one yet:

- [ ] Go to Namecheap.com
- [ ] Buy domain ($8.88/year for .com)
- [ ] Save domain name

### Step 6: Configure Domain DNS (If you have a domain)

In your domain registrar (Namecheap, etc.):

Add these DNS records:
```
Type: A Record
Host: @
Value: YOUR_VPS_IP

Type: A Record
Host: www
Value: YOUR_VPS_IP
```

- [ ] DNS records added
- [ ] Wait 5-30 minutes for propagation

### Step 7: Setup GitHub Secrets

Go to: `https://github.com/aramadan19912/combined-home-services-backend/settings/secrets/actions`

Add these secrets:

- [ ] `SSH_PRIVATE_KEY` - Copy from: `cat ~/.ssh/contabo_deploy`
- [ ] `VPS_HOST` - Your Contabo VPS IP
- [ ] `VPS_USER` - Enter: `deployer` (or `root`)
- [ ] `DOMAIN_NAME` - Your domain (or VPS IP if no domain)
- [ ] `DB_NAME` - Enter: `homeservices`
- [ ] `DB_USER` - Enter: `homeservices_user`
- [ ] `DB_PASSWORD` - The password you created in Step 3
- [ ] `VITE_API_BASE_URL` - `https://yourdomain.com/api` (or `http://YOUR_VPS_IP/api`)
- [ ] `VITE_AUTH_API_BASE_URL` - Same as above

### Step 8: Deploy!

Push to trigger deployment:

```bash
git push origin main
```

Or re-run the workflow in GitHub Actions:
1. Go to GitHub → Actions tab
2. Click on the workflow
3. Click "Re-run all jobs"

- [ ] Deployment started
- [ ] Wait 5-8 minutes
- [ ] Check deployment logs for success

### Step 9: Verify Deployment

Visit your site:
- [ ] Frontend loads: `https://yourdomain.com` (or `http://YOUR_VPS_IP`)
- [ ] API responds: `https://yourdomain.com/api` (or `http://YOUR_VPS_IP/api`)

Test login:
- [ ] Can register new account
- [ ] Can login with email/password
- [ ] Can access dashboard

---

## 🎉 You're Live!

- [ ] Application is running
- [ ] Users can register and login
- [ ] All features working

---

## 📊 What You Should See

### On Your VPS:
```bash
# Check if services are running
sudo systemctl status homeservices-api
sudo systemctl status nginx
sudo systemctl status postgresql
```

### On Your Browser:
- Frontend: Your React app loads
- Backend API: Returns JSON responses
- Can create account and login

---

## 🔧 Troubleshooting

### Can't SSH to VPS?
```bash
# Make sure you're using correct IP and password from Contabo email
# Try VNC console from Contabo panel if SSH fails
```

### Script fails?
```bash
# Check if Ubuntu 22.04 LTS was installed
lsb_release -a

# If not, reinstall OS from Contabo panel
```

### DNS not working?
```bash
# Check DNS propagation
ping yourdomain.com

# Wait up to 24 hours for full propagation
```

### Deployment fails?
```bash
# Check GitHub Actions logs
# Verify all secrets are set correctly
# Make sure SSH key is added to VPS
```

---

## 💰 Costs Summary

- Contabo VPS: €3.99/month (~$4.35)
- Domain: $8.88/year (if you bought one)
- Total: ~$61/year

---

## 📚 Detailed Guides

- `CONTABO_SETUP_GUIDE.md` - Complete Contabo setup
- `GITHUB_SECRETS_SETUP.md` - How to configure secrets
- `CICD_QUICK_START.md` - Full CI/CD guide
- `HOSTING_WITH_DOMAIN.md` - Domain setup guide

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Website loads without errors
- ✅ Can register a new account
- ✅ Can login with email/password
- ✅ Can access protected pages
- ✅ API endpoints respond correctly

---

## 🎯 Next Steps After Deployment

1. Share your app with users
2. Monitor performance
3. (Optional) Add Google OAuth later
4. Setup regular backups
5. Add custom features

---

## 📞 Need Help?

- Check the detailed guides
- Review GitHub Actions logs
- Check VPS logs: `sudo journalctl -u homeservices-api -f`
- Verify firewall: `sudo ufw status`

---

**Good luck with your deployment!** 🚀
