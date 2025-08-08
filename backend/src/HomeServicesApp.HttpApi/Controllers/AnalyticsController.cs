using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeServicesApp.Analytics;

namespace HomeServicesApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : AbpControllerBase
    {
        private readonly IAnalyticsAppService _analyticsAppService;

        public AnalyticsController(IAnalyticsAppService analyticsAppService)
        {
            _analyticsAppService = analyticsAppService;
        }

        [HttpGet("dashboard")]
        public async Task<DashboardAnalyticsDto> GetDashboardAnalyticsAsync([FromQuery] AnalyticsFilterDto filter)
        {
            return await _analyticsAppService.GetDashboardAnalyticsAsync(filter);
        }

        [HttpGet("users")]
        public async Task<UserAnalyticsDto> GetUserAnalyticsAsync([FromQuery] AnalyticsFilterDto filter)
        {
            return await _analyticsAppService.GetUserAnalyticsAsync(filter);
        }

        [HttpGet("orders")]
        public async Task<OrderAnalyticsDto> GetOrderAnalyticsAsync([FromQuery] AnalyticsFilterDto filter)
        {
            return await _analyticsAppService.GetOrderAnalyticsAsync(filter);
        }

        [HttpGet("revenue")]
        public async Task<RevenueAnalyticsDto> GetRevenueAnalyticsAsync([FromQuery] AnalyticsFilterDto filter)
        {
            return await _analyticsAppService.GetRevenueAnalyticsAsync(filter);
        }

        [HttpGet("services")]
        public async Task<ServiceAnalyticsDto> GetServiceAnalyticsAsync([FromQuery] AnalyticsFilterDto filter)
        {
            return await _analyticsAppService.GetServiceAnalyticsAsync(filter);
        }

        [HttpGet("providers")]
        public async Task<ProviderAnalyticsDto> GetProviderAnalyticsAsync([FromQuery] AnalyticsFilterDto filter)
        {
            return await _analyticsAppService.GetProviderAnalyticsAsync(filter);
        }

        [HttpGet("realtime")]
        public async Task<RealTimeMetricsDto> GetRealTimeMetricsAsync()
        {
            return await _analyticsAppService.GetRealTimeMetricsAsync();
        }
    }
}
