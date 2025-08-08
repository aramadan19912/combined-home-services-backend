using HomeServicesApp.Samples;
using Xunit;

namespace HomeServicesApp.EntityFrameworkCore.Domains;

[Collection(HomeServicesAppTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<HomeServicesAppEntityFrameworkCoreTestModule>
{

}
