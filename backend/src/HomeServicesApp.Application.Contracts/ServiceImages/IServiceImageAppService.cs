using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.ServiceImages
{
    public interface IServiceImageAppService : ICrudAppService<
        ServiceImageDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateServiceImageDto,
        CreateUpdateServiceImageDto>
    {
        Task<List<ServiceImageDto>> GetByServiceIdAsync(Guid serviceId);
        Task<ServiceImageDto> GetPrimaryImageAsync(Guid serviceId);
        Task<ServiceImageDto> SetPrimaryAsync(Guid id);
        Task ReorderImagesAsync(Guid serviceId, List<Guid> imageIds);
        Task DeleteByServiceIdAsync(Guid serviceId);
    }
}
