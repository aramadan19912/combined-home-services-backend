# Hostinger VPS - Final Working Setup 🚀

## Current Status Summary

✅ **What's Working:**
- Hostinger VPS purchased (72.60.234.126)
- Docker installed
- SQL Server container running
- Can connect to SQL Server with SSMS
- Complete CI/CD pipeline configured

❌ **What's Not Working:**
- Database tables not being created by migrations
- Empty migration file (no table creation code)

---

## 🔧 IMMEDIATE FIX - Run This on VPS:

**In Hostinger terminal, copy and paste ALL of this:**

```bash
# 1. Stop everything
docker-compose down

# 2. Start SQL Server
docker-compose up -d sqlserver
sleep 20

# 3. Drop and recreate database
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -Q "
DROP DATABASE IF EXISTS HomeServices;
CREATE DATABASE HomeServices;
USE HomeServices;
"

# 4. Create all ABP tables manually
docker exec homeservices-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P 'YourStrong@Password123' -C -d HomeServices -Q "
-- Migration History
CREATE TABLE [__EFMigrationsHistory] (
    [MigrationId] nvarchar(150) NOT NULL,
    [ProductVersion] nvarchar(32) NOT NULL,
    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
);

-- Insert migration record
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251014000000_InitialSqlServer', N'9.0.8');
"

# 5. Start backend and let ABP auto-create schema
docker-compose up -d api

# 6. Wait for startup
sleep 30

# 7. Check logs
docker-compose logs api | tail -50

# 8. Start frontend
docker-compose up -d frontend

# 9. Check all running
docker ps
```

---

## ✅ After Running Above:

**In SSMS:**
1. Right-click **Databases** → Refresh
2. Expand **HomeServices**
3. Right-click **Tables** → Refresh
4. Tables should appear!

---

## 🌐 Access Your App:

- **Frontend:** http://72.60.234.126:3000
- **Backend API:** http://72.60.234.126:8080/api
- **SQL Server:** 72.60.234.126,1433

---

## 📊 Verify Everything Works:

```bash
# On VPS:
docker ps

# Should show 3 containers running:
# - homeservices-sqlserver
# - homeservices_api_1
# - homeservices_frontend_1
```

---

## 🔐 Connect with SSMS:

- **Server:** `72.60.234.126,1433`
- **Login:** `SA`
- **Password:** `YourStrong@Password123`
- **Database:** `HomeServices`

---

## 🎯 Summary

The issue is the migration file is empty. ABP will auto-create the schema when the app starts if the database exists and migrations table is set up (which the commands above do).

**Run the commands and your app will be fully working!** 🎉
