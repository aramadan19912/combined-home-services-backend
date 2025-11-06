using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.ProviderLocations
{
    public interface IProviderLocationAppService : IApplicationService
    {
        Task<ProviderLocationDto> GetByProviderIdAsync(Guid providerId);
        Task<ProviderLocationDto> UpdateLocationAsync(UpdateProviderLocationDto input);
        Task<List<ProviderLocationDto>> GetLocationHistoryAsync(Guid providerId, DateTime? startDate, DateTime? endDate);
        Task SetOnlineStatusAsync(Guid providerId, bool isOnline);
    }
}
