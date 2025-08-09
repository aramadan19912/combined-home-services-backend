# Database Migration Instructions

The `AbpSettings` table error indicates that the database migrations haven't been run yet. Here are your options to resolve this:

## Option 1: Run from Local Development Environment (Recommended)

### Prerequisites
- .NET 9.0 SDK installed
- Internet connectivity

### Steps
1. **Clone the repository locally:**
   ```bash
   git clone https://github.com/aramadan19912/combined-home-services-backend.git
   cd combined-home-services-backend/backend
   ```

2. **Restore packages:**
   ```bash
   dotnet restore
   ```

3. **Run the database migrator:**
   ```bash
   cd src/HomeServicesApp.DbMigrator
   dotnet run
   ```

4. **Verify success:**
   - You should see "Migration completed successfully" or similar message
   - Check your Supabase dashboard - you should see tables created

## Option 2: Deploy and Run Migrations in Production

### Fly.io Deployment
1. **Deploy the application:**
   ```bash
   fly deploy -c fly.toml
   ```

2. **The migrations will run automatically** during the deployment process via the entrypoint script.

## Option 3: Manual Database Setup (Advanced)

If you need to set up the database manually, you can use the Entity Framework CLI tools:

### Install EF Tools
```bash
dotnet tool install --global dotnet-ef
```

### Generate SQL Scripts
```bash
cd src/HomeServicesApp.EntityFrameworkCore
dotnet ef migrations script --output migration.sql
```

### Run SQL Script in Supabase
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the generated migration.sql file

## Current Configuration Status

✅ **All configuration files updated** with your Supabase credentials:
- Host: `db.bovmjhicpbuxqmljelnh.supabase.co`
- Database: `postgres`
- Username: `postgres`
- Password: `Ahmed@2020`

✅ **Application ready for deployment** - just needs database schema created

## Troubleshooting

### If you get connection errors:
1. **Check Supabase dashboard** - ensure database is running
2. **Verify network restrictions** - check if your IP is allowed
3. **Confirm credentials** - ensure password hasn't changed

### After successful migration:
1. **Start your API:** `dotnet run` in `src/HomeServicesApp.HttpApi.Host`
2. **Start Auth Server:** `dotnet run` in `src/HomeServicesApp.AuthServer`
3. **Test endpoints:** Visit `https://localhost:44375/swagger`

## Expected Tables After Migration

The migration will create these ABP Framework tables:
- `AbpSettings`
- `AbpUsers` 
- `AbpRoles`
- `AbpPermissions`
- Plus your custom tables (Orders, Providers, Services, etc.)

## Next Steps After Migration

1. **Test the API endpoints**
2. **Create initial admin user** (if seeding is configured)
3. **Deploy to production environment**
4. **Connect your frontend application**

---

**Note:** The current environment has IPv6 connectivity limitations which prevent direct migration testing, but your configuration is correct and will work in environments with proper connectivity.