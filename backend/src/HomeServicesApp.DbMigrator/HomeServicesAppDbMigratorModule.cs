using HomeServicesApp.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Caching;
using Volo.Abp.Modularity;

namespace HomeServicesApp.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(AbpCachingModule),
    typeof(HomeServicesAppEntityFrameworkCoreModule),
    typeof(HomeServicesAppApplicationContractsModule)
    )]
public class HomeServicesAppDbMigratorModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpDistributedCacheOptions>(options => { options.KeyPrefix = "HomeServicesApp:"; });
    }
}
