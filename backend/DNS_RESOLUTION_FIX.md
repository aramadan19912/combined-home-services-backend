# DNS Resolution Error - Solutions

## 🔍 **Problem Identified**

You're getting a `SocketException: The requested name is valid, but no data of the requested type was found` error. This is a DNS resolution issue where your environment cannot resolve the Supabase hostname.

**Error Details:**
- **Hostname:** `db.bovmjhicpbuxqmljelnh.supabase.co`
- **Issue:** DNS can't find IP address for this hostname
- **Root Cause:** Environment network restrictions or DNS configuration

## 🚀 **Solution 1: Use Connection Pooler (Recommended)**

Update your connection string to use the Supabase connection pooler which has better DNS resolution:

### Update `appsettings.json` files:

**For API Host (`src/HomeServicesApp.HttpApi.Host/appsettings.json`):**
```json
{
  "Database": {
    "Provider": "PostgreSql"
  },
  "ConnectionStrings": {
    "Default": "Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;"
  }
}
```

**For Auth Server (`src/HomeServicesApp.AuthServer/appsettings.json`):**
```json
{
  "Database": {
    "Provider": "PostgreSql"
  },
  "ConnectionStrings": {
    "Default": "Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;"
  }
}
```

**For DbMigrator (`src/HomeServicesApp.DbMigrator/appsettings.json`):**
```json
{
  "Database": {
    "Provider": "PostgreSql"
  },
  "ConnectionStrings": {
    "Default": "Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;"
  }
}
```

### **Key Changes:**
- **Host:** `aws-0-eu-west-1.pooler.supabase.com` (has IPv4 addresses)
- **Port:** `6543` (pooler port)
- **Username:** `postgres.bovmjhicpbuxqmljelnh` (includes project ref)

## 🚀 **Solution 2: Direct IP Address**

If you can get the IP address of your Supabase instance:

```bash
# Try to resolve IP (run where DNS works)
nslookup db.bovmjhicpbuxqmljelnh.supabase.co
```

Then use the IP directly:
```json
{
  "ConnectionStrings": {
    "Default": "Host=1.2.3.4;Port=5432;Database=postgres;Username=postgres;Password=Ahmed@2020;SSL Mode=Require;"
  }
}
```

## 🚀 **Solution 3: Environment Variables**

Set connection string as environment variable to override config:

### Windows:
```cmd
set ConnectionStrings__Default=Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;
```

### Linux/Mac:
```bash
export ConnectionStrings__Default="Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;"
```

## 🚀 **Solution 4: Update DNS Settings**

### Add to hosts file (temporary fix):

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
**Linux/Mac:** `/etc/hosts`

Add line:
```
# Get actual IP first, example:
52.209.89.87 db.bovmjhicpbuxqmljelnh.supabase.co
```

## 🚀 **Solution 5: Docker/Container Fix**

If running in Docker, update your docker-compose or Dockerfile:

```dockerfile
# Add DNS servers
RUN echo "nameserver 8.8.8.8" >> /etc/resolv.conf
RUN echo "nameserver 8.8.4.4" >> /etc/resolv.conf
```

Or use Docker run with DNS:
```bash
docker run --dns=8.8.8.8 --dns=8.8.4.4 your-app
```

## 🚀 **Solution 6: Production Deployment**

For Fly.io deployment, set as secrets:

```bash
# Using connection pooler
fly secrets set ConnectionStrings__Default="Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;" -a homeservicesapp-api

fly secrets set ConnectionStrings__Default="Host=aws-0-eu-west-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.bovmjhicpbuxqmljelnh;Password=Ahmed@2020;SSL Mode=Require;" -a homeservicesapp-auth
```

## 🔍 **Testing Connectivity**

Test if the pooler works:
```bash
# Test pooler connectivity
telnet aws-0-eu-west-1.pooler.supabase.com 6543

# Or with curl
curl -v aws-0-eu-west-1.pooler.supabase.com:6543
```

Test if direct connection works:
```bash
# Test direct connectivity  
telnet db.bovmjhicpbuxqmljelnh.supabase.co 5432
```

## 📋 **Recommended Approach**

1. **Try Solution 1 first** (Connection Pooler) - This has the highest success rate
2. **If pooler fails**, try Solution 3 (Environment Variables)
3. **For production**, always use Solution 6 (Secrets)

## 🎯 **Expected Result**

After fixing DNS resolution, you should see:
- ✅ Successful database connection
- ✅ Migrations running successfully
- ✅ Tables created in Supabase
- ✅ API endpoints working

## 🆘 **If All Solutions Fail**

The issue might be environment-specific network restrictions. In that case:

1. **Run from a different environment** (local machine, different cloud provider)
2. **Use Supabase SQL Editor** to run migration scripts manually
3. **Contact your network administrator** about DNS/firewall restrictions

---

**💡 The connection pooler (Solution 1) should resolve your DNS issues immediately!**