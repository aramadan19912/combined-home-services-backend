using HomeServicesApp.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace HomeServicesApp.Permissions;

public class HomeServicesAppPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(HomeServicesAppPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(HomeServicesAppPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<HomeServicesAppResource>(name);
    }
}
