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

        // Using SQL Server only
        var builder = new DbContextOptionsBuilder<HomeServicesAppDbContext>();
        builder.UseSqlServer(configuration.GetConnectionString("Default"), sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });

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
