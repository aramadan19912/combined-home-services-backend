#!/usr/bin/env bash
set -euo pipefail

# Allow overriding the connection string via env var, default to Supabase PostgreSQL
: "${ConnectionStrings__Default:=Host=your-supabase-host.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-supabase-password;SSL Mode=Require;}"
export ConnectionStrings__Default

# Set database provider to PostgreSQL
: "${Database__Provider:=PostgreSql}"
export Database__Provider

# Optionally allow overriding CORS origins via env var
: "${App__CorsOrigins:=https://localhost:5173}"
export App__CorsOrigins

# Run migrations first
if [ -f "/app/migrator/HomeServicesApp.DbMigrator.dll" ]; then
  echo "Running database migrations..."
  dotnet /app/migrator/HomeServicesApp.DbMigrator.dll || echo "DbMigrator finished with a non-zero exit code or no migrations. Continuing..."
fi

# Start the API host
exec dotnet /app/host/HomeServicesApp.HttpApi.Host.dll