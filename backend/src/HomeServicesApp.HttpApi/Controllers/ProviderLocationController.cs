using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using HomeServicesApp.ProviderLocations;

namespace HomeServicesApp.Controllers
{
    [Area("app")]
    [RemoteService(Name = "app")]
    [Route("api/tracking")]
    public class ProviderLocationController : HomeServicesAppController
    {
        private readonly IProviderLocationAppService _providerLocationAppService;

        public ProviderLocationController(IProviderLocationAppService providerLocationAppService)
        {
            _providerLocationAppService = providerLocationAppService;
        }

        [HttpGet]
        [Route("provider/{providerId}")]
        public async Task<ProviderLocationDto> GetByProviderIdAsync(Guid providerId)
        {
            return await _providerLocationAppService.GetByProviderIdAsync(providerId);
        }

        [HttpPost]
        [Route("update")]
        public async Task<ProviderLocationDto> UpdateLocationAsync([FromBody] UpdateProviderLocationDto input)
        {
            return await _providerLocationAppService.UpdateLocationAsync(input);
        }

        [HttpGet]
        [Route("provider/{providerId}/history")]
        public async Task<List<ProviderLocationDto>> GetLocationHistoryAsync(
            Guid providerId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            return await _providerLocationAppService.GetLocationHistoryAsync(providerId, startDate, endDate);
        }

        [HttpPost]
        [Route("status")]
        public async Task SetOnlineStatusAsync([FromBody] SetOnlineStatusDto input)
        {
            await _providerLocationAppService.SetOnlineStatusAsync(input.ProviderId, input.IsOnline);
        }
    }

    public class SetOnlineStatusDto
    {
        public Guid ProviderId { get; set; }
        public bool IsOnline { get; set; }
    }
}
