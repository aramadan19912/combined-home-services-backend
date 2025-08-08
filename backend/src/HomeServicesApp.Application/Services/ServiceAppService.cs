using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.Services;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Services
{
    public class ServiceAppService : CrudAppService<
        Service, // The Entity
        ServiceDto, // DTO to return
        Guid, // Primary Key
        PagedAndSortedResultRequestDto, // Paging
        CreateUpdateServiceDto, // Create
        CreateUpdateServiceDto // Update
    >, IServiceAppService
    {
        public ServiceAppService(IRepository<Service, Guid> repository)
            : base(repository)
        {
        }

        public async Task<List<ServiceDto>> GetServicesByCategoryAsync(string category)
        {
            var services = await Repository.GetListAsync(x => x.Category == category);
            return ObjectMapper.Map<List<Service>, List<ServiceDto>>(services);
        }

        public async Task<List<ServiceDto>> SearchServicesAsync(ServiceSearchDto input)
        {
            var queryable = await Repository.GetQueryableAsync();
            
            if (!string.IsNullOrWhiteSpace(input.SearchTerm))
                queryable = queryable.Where(x => x.Name.Contains(input.SearchTerm));
            
            if (!string.IsNullOrWhiteSpace(input.Category))
                queryable = queryable.Where(x => x.Category == input.Category);
            
            if (input.MinPrice.HasValue)
                queryable = queryable.Where(x => x.Price >= input.MinPrice.Value);
            
            if (input.MaxPrice.HasValue)
                queryable = queryable.Where(x => x.Price <= input.MaxPrice.Value);

            var services = queryable.ToList();
            return ObjectMapper.Map<List<Service>, List<ServiceDto>>(services);
        }

        public async Task<List<string>> GetServiceCategoriesAsync()
        {
            var services = await Repository.GetListAsync();
            return services.Select(s => s.Category).Distinct().ToList();
        }

        public async Task<List<ServiceDto>> GetPopularServicesAsync(int count)
        {
            var services = await Repository.GetListAsync();
            return ObjectMapper.Map<List<Service>, List<ServiceDto>>(services.Take(count).ToList());
        }

        public async Task<List<ServiceDto>> GetServicesByProviderAsync(Guid providerId)
        {
            var services = await Repository.GetListAsync(x => x.ProviderId == providerId);
            return ObjectMapper.Map<List<Service>, List<ServiceDto>>(services);
        }

        public async Task<ServiceDto> UpdateServicePricingAsync(Guid serviceId, decimal newPrice)
        {
            var service = await Repository.GetAsync(serviceId);
            service.Price = newPrice;
            await Repository.UpdateAsync(service);
            return ObjectMapper.Map<Service, ServiceDto>(service);
        }

        public async Task<List<ServiceDto>> GetFeaturedServicesAsync()
        {
            var services = await Repository.GetListAsync(x => x.IsFeatured);
            return ObjectMapper.Map<List<Service>, List<ServiceDto>>(services);
        }
    }

    public interface IServiceAppService : ICrudAppService<
        ServiceDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateServiceDto,
        CreateUpdateServiceDto>
    {
        Task<List<ServiceDto>> GetServicesByCategoryAsync(string category);
        Task<List<ServiceDto>> SearchServicesAsync(ServiceSearchDto input);
        Task<List<string>> GetServiceCategoriesAsync();
        Task<List<ServiceDto>> GetPopularServicesAsync(int count);
        Task<List<ServiceDto>> GetServicesByProviderAsync(Guid providerId);
        Task<ServiceDto> UpdateServicePricingAsync(Guid serviceId, decimal newPrice);
        Task<List<ServiceDto>> GetFeaturedServicesAsync();
    }
}    