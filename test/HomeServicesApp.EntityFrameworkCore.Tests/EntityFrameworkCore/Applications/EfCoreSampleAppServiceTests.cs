using HomeServicesApp.Samples;
using Xunit;

namespace HomeServicesApp.EntityFrameworkCore.Applications;

[Collection(HomeServicesAppTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<HomeServicesAppEntityFrameworkCoreTestModule>
{

}
