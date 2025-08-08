using Xunit;

namespace HomeServicesApp.EntityFrameworkCore;

[CollectionDefinition(HomeServicesAppTestConsts.CollectionDefinitionName)]
public class HomeServicesAppEntityFrameworkCoreCollection : ICollectionFixture<HomeServicesAppEntityFrameworkCoreFixture>
{

}
