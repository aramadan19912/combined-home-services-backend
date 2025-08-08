using Volo.Abp.Account;
using Volo.Abp.AutoMapper;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.TenantManagement;
using Microsoft.Extensions.DependencyInjection;

namespace HomeServicesApp;

[DependsOn(
    typeof(HomeServicesAppDomainModule),
    typeof(AbpAccountApplicationModule),
    typeof(HomeServicesAppApplicationContractsModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpPermissionManagementApplicationModule),
    typeof(AbpTenantManagementApplicationModule),
    typeof(AbpFeatureManagementApplicationModule),
    typeof(AbpSettingManagementApplicationModule)
    )]
public class HomeServicesAppApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpAutoMapperOptions>(options =>
        {
            options.AddMaps<HomeServicesAppApplicationModule>();
        });
        context.Services.AddTransient<IEmailSender, SmtpEmailSender>();
        context.Services.AddTransient<ISmsSender, TwilioSmsSender>();
        context.Services.AddSingleton<IPushNotificationSender, StubPushNotificationSender>();
        context.Services.AddSingleton<IFileStorageService, LocalFileStorageService>();
    }
}
