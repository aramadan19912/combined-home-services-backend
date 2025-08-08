using Volo.Abp.Modularity;

namespace HomeServicesApp;

[DependsOn(
    typeof(HomeServicesAppDomainModule),
    typeof(HomeServicesAppTestBaseModule)
)]
public class HomeServicesAppDomainTestModule : AbpModule
{

}
