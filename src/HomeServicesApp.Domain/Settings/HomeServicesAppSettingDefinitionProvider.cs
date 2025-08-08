using Volo.Abp.Settings;

namespace HomeServicesApp.Settings;

public class HomeServicesAppSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(HomeServicesAppSettings.MySetting1));
    }
}
