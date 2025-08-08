using Volo.Abp.Modularity;

namespace HomeServicesApp;

public abstract class HomeServicesAppApplicationTestBase<TStartupModule> : HomeServicesAppTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
