using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.ServiceCategories
{
    public interface IServiceCategoryAppService : ICrudAppService<
        ServiceCategoryDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateServiceCategoryDto,
        CreateUpdateServiceCategoryDto>
    {
        Task<List<ServiceCategoryDto>> GetRootCategoriesAsync(Country? country = null);
        Task<List<ServiceCategoryDto>> GetSubcategoriesAsync(Guid parentId);
        Task<List<ServiceCategoryDto>> GetFeaturedCategoriesAsync(Country? country = null);
        Task<List<ServiceCategoryDto>> GetCategoryTreeAsync(Country? country = null);
        Task<List<ServiceCategoryDto>> SearchCategoriesAsync(string searchTerm, Country? country = null);
        Task<ServiceCategoryDto> ToggleFeaturedAsync(Guid id);
        Task<ServiceCategoryDto> ToggleActiveAsync(Guid id);
    }
}
