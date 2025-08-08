using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.Monitoring
{
    public interface IMonitoringAppService : IApplicationService
    {
        Task<SystemHealthDto> GetSystemHealthAsync();
        Task<PerformanceMetricsDto> GetPerformanceMetricsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<DatabaseMetricsDto> GetDatabaseMetricsAsync();
        Task<SecurityMetricsDto> GetSecurityMetricsAsync();
        Task<LogAnalyticsDto> GetLogAnalyticsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<MonitoringConfigDto> GetMonitoringConfigAsync();
        Task UpdateMonitoringConfigAsync(MonitoringConfigDto config);
    }
}
