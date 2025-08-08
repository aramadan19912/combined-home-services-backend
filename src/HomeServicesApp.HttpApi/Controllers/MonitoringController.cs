using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeServicesApp.Monitoring;
using System;

namespace HomeServicesApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class MonitoringController : AbpControllerBase
    {
        private readonly IMonitoringAppService _monitoringAppService;

        public MonitoringController(IMonitoringAppService monitoringAppService)
        {
            _monitoringAppService = monitoringAppService;
        }

        [HttpGet("health")]
        public async Task<SystemHealthDto> GetSystemHealthAsync()
        {
            return await _monitoringAppService.GetSystemHealthAsync();
        }

        [HttpGet("performance")]
        public async Task<PerformanceMetricsDto> GetPerformanceMetricsAsync([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            return await _monitoringAppService.GetPerformanceMetricsAsync(startDate, endDate);
        }

        [HttpGet("database")]
        public async Task<DatabaseMetricsDto> GetDatabaseMetricsAsync()
        {
            return await _monitoringAppService.GetDatabaseMetricsAsync();
        }

        [HttpGet("security")]
        public async Task<SecurityMetricsDto> GetSecurityMetricsAsync()
        {
            return await _monitoringAppService.GetSecurityMetricsAsync();
        }

        [HttpGet("logs")]
        public async Task<LogAnalyticsDto> GetLogAnalyticsAsync([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            return await _monitoringAppService.GetLogAnalyticsAsync(startDate, endDate);
        }

        [HttpGet("config")]
        public async Task<MonitoringConfigDto> GetMonitoringConfigAsync()
        {
            return await _monitoringAppService.GetMonitoringConfigAsync();
        }

        [HttpPut("config")]
        public async Task UpdateMonitoringConfigAsync([FromBody] MonitoringConfigDto config)
        {
            await _monitoringAppService.UpdateMonitoringConfigAsync(config);
        }
    }
}
