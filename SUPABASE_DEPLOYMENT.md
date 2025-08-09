# Supabase Deployment (Postgres)

This project runs the backend on Fly.io. Supabase can be used for the managed Postgres database. Below are the steps to migrate from SQLite/local Postgres to Supabase Postgres and redeploy.

## What this covers
- Use Supabase Postgres as the database for both API and Auth services
- Run ABP/EF Core migrations into Supabase
- Update Fly deployments to use the new DB

Note: Supabase does not host .NET apps. Keep hosting on Fly.io (or similar) and point the connection string to Supabase Postgres.

## Prerequisites
- Supabase project created and running
- Supabase Database password noted (Project Settings → Database)
- Fly CLI installed and authenticated (`fly auth login`)
- .NET 9 SDK installed locally (for running the migrator), or use a CI job

## 1) Get your Supabase Postgres connection string
In Supabase Studio:
- Go to Project Settings → Database → Connection string: "URI" or "psql"
- Copy the Postgres connection string and ensure SSL is enforced

Example (edit values accordingly):
```
Host=YOUR_PROJECT.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;SslMode=Require;Trust Server Certificate=True
```

## 2) Run migrations into Supabase
You have two options: temporarily set env vars and run the migrator, or edit the migrator `appsettings.json`.

Recommended (no file edits):
```bash
# From repo root
export ConnectionStrings__Default="Host=YOUR_PROJECT.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;SslMode=Require;Trust Server Certificate=True"
export Database__Provider=PostgreSql

# Run EF/ABP migrator against Supabase
DOTNET_ENVIRONMENT=Production \
  ConnectionStrings__Default="$ConnectionStrings__Default" \
  Database__Provider="$Database__Provider" \
  dotnet run --project backend/src/HomeServicesApp.DbMigrator
```

If you prefer a file-based config, you can temporarily edit `backend/src/HomeServicesApp.DbMigrator/appsettings.json` with your connection string and set `"Provider": "PostgreSql"`, then run `dotnet run` in that project.

## 3) Point Fly apps to Supabase (secrets)
Set secrets for both apps so they use Supabase in production. Do NOT commit secrets; use Fly secrets.

API app (`homeservicesapp-api`):
```bash
fly secrets set \
  Database__Provider=PostgreSql \
  ConnectionStrings__Default="Host=YOUR_PROJECT.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;SslMode=Require;Trust Server Certificate=True" \
  -a homeservicesapp-api
```

Auth app (`homeservicesapp-auth`):
```bash
fly secrets set \
  Database__Provider=PostgreSql \
  ConnectionStrings__Default="Host=YOUR_PROJECT.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_DB_PASSWORD;SslMode=Require;Trust Server Certificate=True" \
  -a homeservicesapp-auth
```

Tip: You may also want to set `App__CorsOrigins` to include your frontend URL if not already set in `backend/fly.toml`.

## 4) Redeploy services on Fly
```bash
# API
(cd backend && fly deploy)

# Auth
(cd backend && fly deploy --config fly-auth.toml)
```

Both apps will boot with Npgsql and connect to Supabase.

## 5) Frontend config
Set the frontend to point at the deployed backend URLs (not Supabase):
```bash
# Example Vite env (e.g., in your hosting provider env vars)
VITE_API_BASE_URL=https://homeservicesapp-auth.fly.dev
VITE_API_HOST_URL=https://homeservicesapp-api.fly.dev
```

The file `frontend/src/lib/config.ts` already reads these at runtime.

## Troubleshooting
- Connection refused: ensure your Supabase project is running and the password is correct
- SSL errors: make sure `SslMode=Require;Trust Server Certificate=True` are present
- Migrations missing: rerun the DbMigrator with Supabase connection string (step 2)
- CORS issues: update `App__CorsOrigins` in Fly secrets or `fly.toml`

## Optional: Using Supabase Auth/Storage
This project already uses OpenIddict-based auth. Migrating to Supabase Auth/Storage is possible but non-trivial and out of scope here. If you want that, open an issue and we can plan the refactor.