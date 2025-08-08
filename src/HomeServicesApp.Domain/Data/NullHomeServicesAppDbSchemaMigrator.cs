using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace HomeServicesApp.Data;

/* This is used if database provider does't define
 * IHomeServicesAppDbSchemaMigrator implementation.
 */
public class NullHomeServicesAppDbSchemaMigrator : IHomeServicesAppDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
