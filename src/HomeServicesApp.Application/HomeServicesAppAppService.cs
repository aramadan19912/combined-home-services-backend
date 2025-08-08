using System;
using System.Collections.Generic;
using System.Text;
using HomeServicesApp.Localization;
using Volo.Abp.Application.Services;

namespace HomeServicesApp;

/* Inherit your application services from this class.
 */
public abstract class HomeServicesAppAppService : ApplicationService
{
    protected HomeServicesAppAppService()
    {
        LocalizationResource = typeof(HomeServicesAppResource);
    }
}
