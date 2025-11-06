using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace HomeServicesApp.ProviderLocations
{
    public class ProviderLocationAppService : ApplicationService, IProviderLocationAppService
    {
        private readonly IRepository<ProviderLocation, Guid> _providerLocationRepository;

        public ProviderLocationAppService(IRepository<ProviderLocation, Guid> providerLocationRepository)
        {
            _providerLocationRepository = providerLocationRepository;
        }

        public async Task<ProviderLocationDto> GetByProviderIdAsync(Guid providerId)
        {
            var location = await _providerLocationRepository.FirstOrDefaultAsync(x => x.ProviderId == providerId);
            return ObjectMapper.Map<ProviderLocation, ProviderLocationDto>(location);
        }

        public async Task<ProviderLocationDto> UpdateLocationAsync(UpdateProviderLocationDto input)
        {
            var location = await _providerLocationRepository.FirstOrDefaultAsync(x => x.ProviderId == input.ProviderId);

            if (location == null)
            {
                location = new ProviderLocation
                {
                    ProviderId = input.ProviderId,
                    IsOnline = true
                };
            }

            location.Latitude = input.Latitude;
            location.Longitude = input.Longitude;
            location.Accuracy = input.Accuracy;
            location.Speed = input.Speed;
            location.Heading = input.Heading;
            location.LastUpdated = DateTime.UtcNow;

            if (location.Id == Guid.Empty)
            {
                await _providerLocationRepository.InsertAsync(location, autoSave: true);
            }
            else
            {
                await _providerLocationRepository.UpdateAsync(location, autoSave: true);
            }

            return ObjectMapper.Map<ProviderLocation, ProviderLocationDto>(location);
        }

        public async Task<List<ProviderLocationDto>> GetLocationHistoryAsync(
            Guid providerId,
            DateTime? startDate,
            DateTime? endDate)
        {
            var query = await _providerLocationRepository.GetQueryableAsync();
            query = query.Where(x => x.ProviderId == providerId);

            if (startDate.HasValue)
            {
                query = query.Where(x => x.LastUpdated >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(x => x.LastUpdated <= endDate.Value);
            }

            var locations = await AsyncExecuter.ToListAsync(
                query.OrderBy(x => x.LastUpdated)
            );

            return ObjectMapper.Map<List<ProviderLocation>, List<ProviderLocationDto>>(locations);
        }

        public async Task SetOnlineStatusAsync(Guid providerId, bool isOnline)
        {
            var location = await _providerLocationRepository.FirstOrDefaultAsync(x => x.ProviderId == providerId);

            if (location != null)
            {
                location.IsOnline = isOnline;
                location.LastUpdated = DateTime.UtcNow;
                await _providerLocationRepository.UpdateAsync(location, autoSave: true);
            }
        }
    }
}
