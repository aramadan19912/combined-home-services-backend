using System.Threading.Tasks;
using HomeServicesApp.Dashboard;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace HomeServicesApp.Controllers
{
    [Route("api/app/dashboard")]
    public class DashboardController : AbpControllerBase
    {
        private readonly IDashboardAppService _dashboardAppService;

        public DashboardController(IDashboardAppService dashboardAppService)
        {
            _dashboardAppService = dashboardAppService;
        }

        [HttpGet("customer-dashboard")]
        public async Task<CustomerDashboardDto> GetCustomerDashboardAsync()
        {
            return await _dashboardAppService.GetCustomerDashboardAsync();
        }

        [HttpGet("provider-dashboard")]
        public async Task<ProviderDashboardDto> GetProviderDashboardAsync()
        {
            return await _dashboardAppService.GetProviderDashboardAsync();
        }

        [HttpGet("admin-dashboard")]
        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            return await _dashboardAppService.GetAdminDashboardAsync();
        }
    }
}
