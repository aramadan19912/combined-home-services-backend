#!/usr/bin/env bash
set -euo pipefail

# Default to SQL Server; allow override via env vars
: "${ConnectionStrings__Default:=Server=localhost;Database=HomeServices;User Id=SA;Password=YourStrong@Password123;TrustServerCertificate=True}"
export ConnectionStrings__Default

: "${Database__Provider:=SqlServer}"
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