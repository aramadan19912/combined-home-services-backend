# Contabo VPS Setup Guide 🚀

Complete guide to set up Contabo VPS for your Home Services Platform.

## 🖥️ Which Image to Choose on Contabo

### ✅ **RECOMMENDED: Ubuntu 22.04 LTS** ⭐⭐⭐⭐⭐

**Why Ubuntu 22.04 LTS:**
- ✅ Best compatibility with your deployment scripts
- ✅ LTS (Long Term Support) - 5 years of updates
- ✅ All packages available (.NET 8, Node.js 18, PostgreSQL)
- ✅ Most tested and stable
- ✅ Great documentation

### Alternative Options:

**Ubuntu 24.04 LTS** ⭐⭐⭐⭐
- ✅ Newest LTS version
- ✅ Also works great
- ✅ Choose this if available

**Debian 12** ⭐⭐⭐⭐
- ✅ Very stable
- ✅ Similar to Ubuntu
- ✅ Works with your scripts

❌ **Don't Choose:**
- CentOS/AlmaLinux (different package manager)
- Windows Server (more expensive, not needed)
- openSUSE (less common, harder setup)

---

## 📋 Contabo Order Process - Step by Step

### Step 1: Choose Your Plan

**Recommended: VPS S**
- **Price:** €3.99/month (~$4.35)
- **Specs:** 4 vCPU, 6GB RAM, 200GB SSD
- **Bandwidth:** Unlimited
- **Perfect for your app!**

### Step 2: Configuration Options

When ordering, you'll see these options:

#### 1️⃣ **Operating System**
```
✅ Choose: Ubuntu 22.04 LTS (64-bit)
```

#### 2️⃣ **Data Center Location**
Choose closest to your users:
- **Europe:** Germany (Nuremberg) - Default
- **USA:** East Coast (New York) or West Coast (St. Louis)
- **Asia:** Singapore

```
✅ Recommended: Germany (fastest for EU)
✅ USA: New York or St. Louis
✅ Asia: Singapore
```

#### 3️⃣ **Storage Type**
```
✅ Choose: SSD (default) - Much faster than HDD
```

#### 4️⃣ **Additional Options**
- **Backup:** Optional (+€2/month) - Not needed initially
- **Snapshots:** Optional - Not needed initially
- **DDoS Protection:** Included free ✅

#### 5️⃣ **Contract Period**
```
✅ Choose: 1 month (most flexible)
💡 Or: 6-12 months (slight discount, but less flexible)
```

---

## 🔧 After Ordering - First Setup

### You'll Receive Email With:
- VPS IP address: `123.45.67.89`
- Root password: `YourRootPassword`
- VPS name: `vmi123456.contaboserver.net`

### Step 1: First Login

```bash
# SSH into your Contabo VPS
ssh root@YOUR_VPS_IP

# When prompted, type 'yes' to accept fingerprint
# Enter the root password from email
```

### Step 2: Change Root Password (Important!)

```bash
# Change to a secure password
passwd

# Enter new password twice
# Save this password securely!
```

### Step 3: Update System

```bash
# Update package lists
apt update

# Upgrade all packages
apt upgrade -y

# This takes 2-5 minutes
```

### Step 4: Run Your Setup Script

```bash
# Download your setup script
curl -o setup-vps.sh https://raw.githubusercontent.com/aramadan19912/combined-home-services-backend/main/scripts/setup-vps.sh

# Make it executable
chmod +x setup-vps.sh

# Run the setup script
bash setup-vps.sh
```

**The script will ask for:**
1. Domain name (e.g., `example.com`)
2. Email for SSL (e.g., `your@email.com`)
3. Database password (create a strong one!)
4. Your SSH public key (for GitHub Actions)

---

## 🌐 Connect Your Domain

### Get Your VPS IP

```bash
# Your VPS IP is in the email from Contabo
# Or run this on your VPS:
hostname -I | awk '{print $1}'
```

### Configure DNS at Namecheap (or your registrar)

1. Login to Namecheap
2. Go to **Domain List**
3. Click **Manage** on your domain
4. Go to **Advanced DNS**
5. Add these records:

```
Type: A Record
Host: @
Value: YOUR_CONTABO_IP
TTL: 300

Type: A Record  
Host: www
Value: YOUR_CONTABO_IP
TTL: 300
```

### Wait for DNS Propagation

```bash
# Check if DNS is working (from your local machine)
ping yourdomain.com

# Should show your Contabo IP
```

---

## 🔐 Setup GitHub Secrets

Add these to your GitHub repository:

```
SSH_PRIVATE_KEY: (Your private key from ~/.ssh/hostinger_deploy)
VPS_HOST: YOUR_CONTABO_IP
VPS_USER: deployer
DOMAIN_NAME: yourdomain.com
DB_NAME: homeservices
DB_USER: homeservices_user
DB_PASSWORD: (Password you set during setup)
VITE_API_BASE_URL: https://yourdomain.com/api
VITE_AUTH_API_BASE_URL: https://yourdomain.com/api
```

See `GITHUB_SECRETS_SETUP.md` for detailed instructions.

---

## 🚀 Deploy Your App

```bash
# From your local machine
git push origin main

# GitHub Actions will automatically deploy!
```

**Wait 5-8 minutes** for deployment to complete.

Your app will be live at: `https://yourdomain.com` 🎉

---

## 📊 Contabo Control Panel

### Access Your Control Panel

1. Go to https://my.contabo.com
2. Login with your Contabo account
3. Click on your VPS

### Useful Features:

**VNC Console:**
- Access your VPS without SSH
- Useful if you get locked out
- Click "VNC Console" button

**Restart/Stop:**
- Restart your VPS
- Emergency stop/start

**Reinstall:**
- Reinstall OS if needed
- ⚠️ This erases everything!

**Monitoring:**
- CPU usage
- RAM usage  
- Network traffic

---

## 💡 Contabo Tips & Tricks

### 1. Firewall Setup (Important!)

Your setup script configures UFW firewall, but verify:

```bash
# Check firewall status
sudo ufw status

# Should see:
# 22/tcp (SSH)
# 80/tcp (HTTP)
# 443/tcp (HTTPS)
```

### 2. Check Services

```bash
# Check if backend is running
sudo systemctl status homeservices-api

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

### 3. View Logs

```bash
# Backend logs
sudo journalctl -u homeservices-api -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 4. Check Resources

```bash
# CPU and RAM usage
htop

# Disk usage
df -h

# Disk space by directory
du -sh /*
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Can't SSH to VPS

**Solution:**
1. Use VNC Console in Contabo panel
2. Check if firewall is blocking SSH
3. Verify you're using correct IP and password

### Issue 2: Website Not Loading

**Solution:**
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check DNS
ping yourdomain.com
```

### Issue 3: API Not Working

**Solution:**
```bash
# Check backend service
sudo systemctl status homeservices-api

# View backend logs
sudo journalctl -u homeservices-api -n 50 --no-pager

# Restart backend
sudo systemctl restart homeservices-api
```

### Issue 4: Out of Disk Space

**Solution:**
```bash
# Check disk usage
df -h

# Clean old Docker images (if using Docker)
docker system prune -a

# Clean old backups
cd /var/www/homeservices/backend
sudo rm -rf publish.backup.*

# Clean package cache
sudo apt clean
```

---

## 📈 Performance Optimization

### Enable Swap (if needed)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Setup Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades

# Enable it
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 💰 Billing & Costs

### What You Pay:

- **VPS S:** €3.99/month
- **Setup Fee:** €4.76 (one-time)
- **Total First Month:** €8.75
- **After First Month:** €3.99/month

### Payment Methods:
- Credit Card ✅
- PayPal ✅
- Bank Transfer ✅

### Cancellation:
- Cancel anytime (no long-term contract if you chose 1-month)
- No cancellation fees
- Pro-rated refunds available

---

## 🔒 Security Best Practices

### 1. Setup SSH Key Authentication

```bash
# On your local machine, create SSH key
ssh-keygen -t ed25519 -f ~/.ssh/contabo_key

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/contabo_key.pub root@YOUR_VPS_IP

# Disable password authentication (optional, more secure)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2. Setup Fail2Ban (Brute Force Protection)

```bash
# Install fail2ban
sudo apt install fail2ban

# It's auto-configured for SSH
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Backups

```bash
# Database backup (automated in setup script)
# Manual backup:
pg_dump -U homeservices_user homeservices > backup.sql

# Download to local machine
scp root@YOUR_VPS_IP:/root/backup.sql ./
```

---

## ✅ Contabo Setup Checklist

- [ ] Order Contabo VPS S (€3.99/month)
- [ ] Choose Ubuntu 22.04 LTS
- [ ] Receive email with IP and password
- [ ] SSH into VPS
- [ ] Change root password
- [ ] Update system (`apt update && apt upgrade`)
- [ ] Run setup-vps.sh script
- [ ] Buy domain from Namecheap ($8.88)
- [ ] Point domain DNS to Contabo IP
- [ ] Configure GitHub Secrets
- [ ] Push to main branch to deploy
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Visit https://yourdomain.com 🎉

---

## 🎉 You're Done!

Your Contabo VPS is now running your Home Services Platform!

**Total Cost:**
- VPS: €3.99/month ($4.35)
- Domain: $8.88/year
- **Total: ~$61/year**

**Your app is live at:** https://yourdomain.com

**Next steps:**
- Share your app with users
- Monitor performance
- Scale as needed

---

## 📞 Support

- **Contabo Support:** https://contabo.com/support
- **Documentation:** Check the guides in your repo
- **Community:** Contabo has active forums

---

## 🔗 Quick Links

- Contabo Control Panel: https://my.contabo.com
- Contabo Status: https://contabo.com/status
- Your GitHub Repo: https://github.com/aramadan19912/combined-home-services-backend

---

**Happy Hosting!** 🚀
