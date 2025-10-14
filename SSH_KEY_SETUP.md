# SSH Key Setup Guide 🔑

Complete guide to generate and use SSH keys for your VPS deployment.

## 🎯 Two Options:

### Option 1: Skip SSH Key for Now (Easier)
- Use password authentication first
- Add SSH key later
- **Recommended for beginners**

### Option 2: Add SSH Key Now (More Secure)
- More secure
- No password needed
- Required for GitHub Actions CI/CD

---

## 🚀 Option 1: Skip SSH Key (Quick Start)

### During Hostinger Setup:
- **SSH Key:** Leave blank or click "Skip"
- **Password:** Will be generated automatically
- You'll get password in email

### Use Password to Login:
```bash
ssh root@YOUR_VPS_IP
# Enter password when prompted
```

✅ **You can add SSH key later!**

---

## 🔐 Option 2: Generate and Add SSH Key

### Step 1: Generate SSH Key (On Your Local Computer)

**On macOS/Linux/Windows (Git Bash):**

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/hostinger_key

# Press Enter for all prompts (no passphrase for automation)
```

This creates:
- `~/.ssh/hostinger_key` (private key) - Keep secret!
- `~/.ssh/hostinger_key.pub` (public key) - Share this

### Step 2: Copy Your Public Key

**macOS:**
```bash
cat ~/.ssh/hostinger_key.pub | pbcopy
# Public key is now copied to clipboard!
```

**Linux:**
```bash
cat ~/.ssh/hostinger_key.pub
# Copy the output manually
```

**Windows (Git Bash):**
```bash
cat ~/.ssh/hostinger_key.pub | clip
# Public key is now copied to clipboard!
```

Or just display and copy:
```bash
cat ~/.ssh/hostinger_key.pub
```

The output looks like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMx... your-email@example.com
```

**Copy the ENTIRE line!**

### Step 3: Add to Hostinger

#### During VPS Creation:
1. In Hostinger control panel
2. Find "SSH Key" field
3. Paste your public key
4. Continue with setup

#### After VPS is Created:
```bash
# SSH using password first
ssh root@YOUR_VPS_IP

# Once logged in, add your SSH key:
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Paste your public key here:
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

### Step 4: Test SSH Key

```bash
# From your local computer
ssh -i ~/.ssh/hostinger_key root@YOUR_VPS_IP

# Should login WITHOUT password!
```

---

## 🎯 For GitHub Actions CI/CD

You need **TWO** different keys:

### Key 1: For GitHub Actions (Deployment)
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy
```

### Key 2: For Your Personal Use (Optional)
```bash
ssh-keygen -t ed25519 -C "my-computer" -f ~/.ssh/hostinger_personal
```

---

## 📋 Complete Setup Example

### Generate Keys:
```bash
# For GitHub Actions
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# You'll have:
# ~/.ssh/github_deploy (private) - For GitHub Secret
# ~/.ssh/github_deploy.pub (public) - For VPS
```

### Add Public Key to VPS:
```bash
# Method 1: During Hostinger setup
# Paste contents of: cat ~/.ssh/github_deploy.pub

# Method 2: After VPS is running
ssh root@YOUR_VPS_IP
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Add Private Key to GitHub Secrets:
```bash
# Copy private key (the one WITHOUT .pub)
cat ~/.ssh/github_deploy

# Add to GitHub:
# Go to: Settings → Secrets → Actions → New secret
# Name: SSH_PRIVATE_KEY
# Value: Paste entire private key (including BEGIN/END lines)
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Permission denied (publickey)"

**Solution:**
```bash
# Check if key is correct
ssh -i ~/.ssh/hostinger_key -v root@YOUR_VPS_IP

# Verify key is on VPS
ssh root@YOUR_VPS_IP "cat ~/.ssh/authorized_keys"
```

### Issue 2: "Key is too open"

**Solution:**
```bash
# Fix permissions
chmod 600 ~/.ssh/hostinger_key
chmod 644 ~/.ssh/hostinger_key.pub
```

### Issue 3: Can't find SSH key

**Solution:**
```bash
# List all your SSH keys
ls -la ~/.ssh/

# Your keys should be there
```

### Issue 4: Multiple keys, which one to use?

**Solution:**
```bash
# Use specific key with -i flag
ssh -i ~/.ssh/specific_key root@YOUR_VPS_IP
```

---

## 🎯 Quick Reference

### Generate Key:
```bash
ssh-keygen -t ed25519 -C "label" -f ~/.ssh/keyname
```

### Copy Public Key:
```bash
cat ~/.ssh/keyname.pub
```

### Add to VPS:
```bash
echo "public-key-content" >> ~/.ssh/authorized_keys
```

### Use Specific Key:
```bash
ssh -i ~/.ssh/keyname user@host
```

---

## ✅ Recommended Setup

### For Quick Start:
1. **Skip SSH key** during Hostinger setup
2. Use password to login
3. Add SSH key later

### For CI/CD (GitHub Actions):
1. Generate SSH key: `ssh-keygen -t ed25519 -f ~/.ssh/github_deploy`
2. Add public key to VPS
3. Add private key to GitHub Secrets (`SSH_PRIVATE_KEY`)
4. Deploy automatically!

---

## 🚀 What to Do NOW

### If Setting Up Hostinger VPS:

**Option A: Use Password (Easier)**
- Skip SSH key field
- Continue with setup
- Get password in email
- Add SSH key later

**Option B: Use SSH Key (More Secure)**
1. Generate key: `ssh-keygen -t ed25519 -f ~/.ssh/hostinger_key`
2. Copy public key: `cat ~/.ssh/hostinger_key.pub`
3. Paste in Hostinger SSH Key field
4. Complete setup

---

## 💡 My Recommendation

**For now:** Skip SSH key, use password

**Why:**
- Faster to get started
- Can add SSH key later in 2 minutes
- Less to configure initially

**After deployment is working:**
- Generate SSH key
- Add to VPS
- Add to GitHub Secrets
- Enable automated deployments

---

## 📞 Need Help?

If you're stuck:
1. Skip SSH key for now
2. Use password authentication
3. Get your VPS running first
4. Add SSH key later

**It's easier to add SSH key to a running VPS than during setup!**

---

## ✅ Summary

**Quick Start:** Skip SSH key → Use password → Add key later

**For CI/CD:** Generate key → Add public to VPS → Add private to GitHub

Both methods work! Choose what's easier for you. 🎉
