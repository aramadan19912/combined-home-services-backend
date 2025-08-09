# Supabase PostgreSQL Setup Guide

This guide will help you configure your HomeServicesApp backend to use Supabase PostgreSQL as the database.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New project"
3. Choose your organization
4. Fill in project details:
   - Name: `homeservicesapp` (or your preferred name)
   - Database Password: Generate a strong password and save it
   - Region: Choose closest to your users

## Step 2: Get Connection Details

1. In your Supabase dashboard, go to Settings > Database
2. Find the "Connection string" section
3. Use the "URI" format connection string
4. Your connection string will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Configure Connection String

Convert the PostgreSQL URI to the format expected by Entity Framework:

```
Host=db.[YOUR-PROJECT-REF].supabase.co;Port=5432;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;
```

## Step 4: Update Configuration Files

### For Development (Local)

1. Copy `.env.example` to `.env.local`
2. Update the connection string in `.env.local`:
   ```
   ConnectionStrings__Default=Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require;
   ```

### For Production (Fly.io)

Set secrets in Fly.io:

```bash
# For API
fly secrets set ConnectionStrings__Default="Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require;" -a homeservicesapp-api

# For Auth Server
fly secrets set ConnectionStrings__Default="Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require;" -a homeservicesapp-auth
```

## Step 5: Run Database Migrations

### Local Development

```bash
cd backend/src/HomeServicesApp.DbMigrator
dotnet run
```

### Production

Migrations will run automatically on application startup via the entrypoint script.

## Step 6: Security Considerations

1. **Never commit passwords to version control**
2. **Use environment variables or secrets management for production**
3. **Enable Row Level Security (RLS) in Supabase if needed**
4. **Consider connection pooling for high-traffic applications**

## Step 7: Verify Connection

1. Start your application
2. Check the logs for successful database connection
3. Verify tables are created in your Supabase dashboard

## Troubleshooting

### Common Issues

1. **SSL Connection Required**: Ensure `SSL Mode=Require;` is in your connection string
2. **Connection Timeout**: Check if your IP is whitelisted in Supabase (Settings > Database > Network Restrictions)
3. **Password Issues**: Ensure special characters in passwords are properly escaped

### Connection Pool Settings

For high-traffic applications, consider adding connection pool settings:

```
Host=db.your-project-ref.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require;Pooling=true;MinPoolSize=0;MaxPoolSize=100;
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Entity Framework Core PostgreSQL Provider](https://www.npgsql.org/efcore/)
- [ABP Framework Database Configuration](https://docs.abp.io/en/abp/latest/Entity-Framework-Core)