using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.ServiceImages;

namespace HomeServicesApp.Controllers
{
    [Area("app")]
    [RemoteService(Name = "HomeServices")]
    [Route("api/service-image")]
    public class ServiceImageController : HomeServicesAppController
    {
        private readonly IServiceImageAppService _serviceImageAppService;

        public ServiceImageController(IServiceImageAppService serviceImageAppService)
        {
            _serviceImageAppService = serviceImageAppService;
        }

        [HttpGet]
        public Task<PagedResultDto<ServiceImageDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            return _serviceImageAppService.GetListAsync(input);
        }

        [HttpGet("{id}")]
        public Task<ServiceImageDto> GetAsync(Guid id)
        {
            return _serviceImageAppService.GetAsync(id);
        }

        [HttpPost]
        public Task<ServiceImageDto> CreateAsync(CreateUpdateServiceImageDto input)
        {
            return _serviceImageAppService.CreateAsync(input);
        }

        [HttpPut("{id}")]
        public Task<ServiceImageDto> UpdateAsync(Guid id, CreateUpdateServiceImageDto input)
        {
            return _serviceImageAppService.UpdateAsync(id, input);
        }

        [HttpDelete("{id}")]
        public Task DeleteAsync(Guid id)
        {
            return _serviceImageAppService.DeleteAsync(id);
        }

        [HttpGet("service/{serviceId}")]
        public Task<List<ServiceImageDto>> GetByServiceIdAsync(Guid serviceId)
        {
            return _serviceImageAppService.GetByServiceIdAsync(serviceId);
        }

        [HttpGet("service/{serviceId}/primary")]
        public Task<ServiceImageDto> GetPrimaryImageAsync(Guid serviceId)
        {
            return _serviceImageAppService.GetPrimaryImageAsync(serviceId);
        }

        [HttpPost("{id}/set-primary")]
        public Task<ServiceImageDto> SetPrimaryAsync(Guid id)
        {
            return _serviceImageAppService.SetPrimaryAsync(id);
        }

        [HttpPost("service/{serviceId}/reorder")]
        public Task ReorderImagesAsync(Guid serviceId, [FromBody] List<Guid> imageIds)
        {
            return _serviceImageAppService.ReorderImagesAsync(serviceId, imageIds);
        }

        [HttpDelete("service/{serviceId}/all")]
        public Task DeleteByServiceIdAsync(Guid serviceId)
        {
            return _serviceImageAppService.DeleteByServiceIdAsync(serviceId);
        }
    }
}
