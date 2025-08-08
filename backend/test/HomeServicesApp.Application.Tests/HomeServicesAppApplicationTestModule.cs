using Volo.Abp.Modularity;

namespace HomeServicesApp;

[DependsOn(
    typeof(HomeServicesAppApplicationModule),
    typeof(HomeServicesAppDomainTestModule)
)]
public class HomeServicesAppApplicationTestModule : AbpModule
{

}
