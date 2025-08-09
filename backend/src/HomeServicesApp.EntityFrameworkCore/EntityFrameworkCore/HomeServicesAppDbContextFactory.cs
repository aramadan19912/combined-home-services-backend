using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace HomeServicesApp.EntityFrameworkCore;

/* This class is needed for EF Core console commands
 * (like Add-Migration and Update-Database commands) */
public class HomeServicesAppDbContextFactory : IDesignTimeDbContextFactory<HomeServicesAppDbContext>
{
    public HomeServicesAppDbContext CreateDbContext(string[] args)
    {
        HomeServicesAppEfCoreEntityExtensionMappings.Configure();

        var configuration = BuildConfiguration();

        var provider = configuration["Database:Provider"] ?? "Sqlite";

        var builder = new DbContextOptionsBuilder<HomeServicesAppDbContext>();
        if (string.Equals(provider, "PostgreSql", StringComparison.OrdinalIgnoreCase) || string.Equals(provider, "Postgres", StringComparison.OrdinalIgnoreCase))
        {
            builder.UseNpgsql(configuration.GetConnectionString("Default"));
        }
        else
        {
            builder.UseSqlite(configuration.GetConnectionString("Default"));
        }

        return new HomeServicesAppDbContext(builder.Options);
    }

    private static IConfigurationRoot BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../HomeServicesApp.DbMigrator/"))
            .AddJsonFile("appsettings.json", optional: false);

        return builder.Build();
    }
}
