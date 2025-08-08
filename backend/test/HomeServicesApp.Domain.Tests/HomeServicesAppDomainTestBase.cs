using Volo.Abp.Modularity;

namespace HomeServicesApp;

/* Inherit from this class for your domain layer tests. */
public abstract class HomeServicesAppDomainTestBase<TStartupModule> : HomeServicesAppTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
