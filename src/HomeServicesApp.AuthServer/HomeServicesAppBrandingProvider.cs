using Microsoft.Extensions.Localization;
using HomeServicesApp.Localization;
using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;

namespace HomeServicesApp;

[Dependency(ReplaceServices = true)]
public class HomeServicesAppBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<HomeServicesAppResource> _localizer;

    public HomeServicesAppBrandingProvider(IStringLocalizer<HomeServicesAppResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
