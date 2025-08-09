#!/bin/bash

# HomeServicesApp Database Migration Script
# This script runs the database migrations for your Supabase PostgreSQL database

set -e

echo "🚀 Starting HomeServicesApp Database Migration..."
echo "📍 Target: Supabase PostgreSQL"
echo "🌐 Host: db.bovmjhicpbuxqmljelnh.supabase.co"

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET is not installed. Please install .NET 9.0 SDK first."
    echo "   Download from: https://dotnet.microsoft.com/download/dotnet/9.0"
    exit 1
fi

echo "✅ .NET SDK found: $(dotnet --version)"

# Navigate to the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📂 Current directory: $(pwd)"

# Restore packages
echo "📦 Restoring NuGet packages..."
dotnet restore

# Navigate to migrator
cd src/HomeServicesApp.DbMigrator

echo "🔄 Running database migrations..."
echo "   Connection: Supabase PostgreSQL"
echo "   Database: postgres"

# Run the migrator
if dotnet run; then
    echo ""
    echo "🎉 Migration completed successfully!"
    echo "✅ Your Supabase database is now ready with all required tables:"
    echo "   • AbpSettings, AbpUsers, AbpRoles"
    echo "   • Orders, Providers, Services"
    echo "   • Reviews, Complaints, Payments"
    echo "   • And all other HomeServicesApp tables"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Start API: cd ../HomeServicesApp.HttpApi.Host && dotnet run"
    echo "   2. Start Auth: cd ../HomeServicesApp.AuthServer && dotnet run"
    echo "   3. Test endpoints at: https://localhost:44375/swagger"
else
    echo ""
    echo "❌ Migration failed!"
    echo "🔍 Common issues and solutions:"
    echo ""
    echo "   1. Network connectivity:"
    echo "      • Ensure you can reach db.bovmjhicpbuxqmljelnh.supabase.co:5432"
    echo "      • Check if your IP is whitelisted in Supabase dashboard"
    echo ""
    echo "   2. Authentication:"
    echo "      • Verify password: Ahmed@2020"
    echo "      • Check if database is active in Supabase dashboard"
    echo ""
    echo "   3. SSL/TLS issues:"
    echo "      • The connection string includes SSL Mode=Require"
    echo "      • Ensure your system supports TLS 1.2+"
    echo ""
    echo "   💡 Try running this script from a different environment if the"
    echo "      current one has network restrictions (like Docker/containers"
    echo "      that don't support IPv6)"
    exit 1
fi