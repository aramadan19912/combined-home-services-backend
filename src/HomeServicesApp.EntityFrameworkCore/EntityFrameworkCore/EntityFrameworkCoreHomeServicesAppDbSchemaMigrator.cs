using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HomeServicesApp.Data;
using Volo.Abp.DependencyInjection;

namespace HomeServicesApp.EntityFrameworkCore;

public class EntityFrameworkCoreHomeServicesAppDbSchemaMigrator
    : IHomeServicesAppDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreHomeServicesAppDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the HomeServicesAppDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<HomeServicesAppDbContext>()
            .Database
            .MigrateAsync();
    }
}
