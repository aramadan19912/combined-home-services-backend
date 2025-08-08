using HomeServicesApp.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace HomeServicesApp.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class HomeServicesAppController : AbpControllerBase
{
    protected HomeServicesAppController()
    {
        LocalizationResource = typeof(HomeServicesAppResource);
    }
}
