using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.Analytics
{
    public interface IAnalyticsAppService : IApplicationService
    {
        Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync(AnalyticsFilterDto filter);
        Task<UserAnalyticsDto> GetUserAnalyticsAsync(AnalyticsFilterDto filter);
        Task<OrderAnalyticsDto> GetOrderAnalyticsAsync(AnalyticsFilterDto filter);
        Task<RevenueAnalyticsDto> GetRevenueAnalyticsAsync(AnalyticsFilterDto filter);
        Task<ServiceAnalyticsDto> GetServiceAnalyticsAsync(AnalyticsFilterDto filter);
        Task<ProviderAnalyticsDto> GetProviderAnalyticsAsync(AnalyticsFilterDto filter);
        Task<RealTimeMetricsDto> GetRealTimeMetricsAsync();
    }
}
