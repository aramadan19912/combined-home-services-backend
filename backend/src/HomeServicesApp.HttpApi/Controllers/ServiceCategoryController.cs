using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.ServiceCategories;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.Controllers
{
    [Area("app")]
    [RemoteService(Name = "HomeServices")]
    [Route("api/service-category")]
    public class ServiceCategoryController : HomeServicesAppController
    {
        private readonly IServiceCategoryAppService _serviceCategoryAppService;

        public ServiceCategoryController(IServiceCategoryAppService serviceCategoryAppService)
        {
            _serviceCategoryAppService = serviceCategoryAppService;
        }

        [HttpGet]
        public Task<PagedResultDto<ServiceCategoryDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            return _serviceCategoryAppService.GetListAsync(input);
        }

        [HttpGet("{id}")]
        public Task<ServiceCategoryDto> GetAsync(Guid id)
        {
            return _serviceCategoryAppService.GetAsync(id);
        }

        [HttpPost]
        public Task<ServiceCategoryDto> CreateAsync(CreateUpdateServiceCategoryDto input)
        {
            return _serviceCategoryAppService.CreateAsync(input);
        }

        [HttpPut("{id}")]
        public Task<ServiceCategoryDto> UpdateAsync(Guid id, CreateUpdateServiceCategoryDto input)
        {
            return _serviceCategoryAppService.UpdateAsync(id, input);
        }

        [HttpDelete("{id}")]
        public Task DeleteAsync(Guid id)
        {
            return _serviceCategoryAppService.DeleteAsync(id);
        }

        [HttpGet("root")]
        public Task<List<ServiceCategoryDto>> GetRootCategoriesAsync([FromQuery] Country? country = null)
        {
            return _serviceCategoryAppService.GetRootCategoriesAsync(country);
        }

        [HttpGet("{parentId}/subcategories")]
        public Task<List<ServiceCategoryDto>> GetSubcategoriesAsync(Guid parentId)
        {
            return _serviceCategoryAppService.GetSubcategoriesAsync(parentId);
        }

        [HttpGet("featured")]
        public Task<List<ServiceCategoryDto>> GetFeaturedCategoriesAsync([FromQuery] Country? country = null)
        {
            return _serviceCategoryAppService.GetFeaturedCategoriesAsync(country);
        }

        [HttpGet("tree")]
        public Task<List<ServiceCategoryDto>> GetCategoryTreeAsync([FromQuery] Country? country = null)
        {
            return _serviceCategoryAppService.GetCategoryTreeAsync(country);
        }

        [HttpGet("search")]
        public Task<List<ServiceCategoryDto>> SearchCategoriesAsync([FromQuery] string searchTerm, [FromQuery] Country? country = null)
        {
            return _serviceCategoryAppService.SearchCategoriesAsync(searchTerm, country);
        }

        [HttpPost("{id}/toggle-featured")]
        public Task<ServiceCategoryDto> ToggleFeaturedAsync(Guid id)
        {
            return _serviceCategoryAppService.ToggleFeaturedAsync(id);
        }

        [HttpPost("{id}/toggle-active")]
        public Task<ServiceCategoryDto> ToggleActiveAsync(Guid id)
        {
            return _serviceCategoryAppService.ToggleActiveAsync(id);
        }
    }
}
