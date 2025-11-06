using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.ServiceCategories
{
    public class ServiceCategoryAppService : CrudAppService<
        ServiceCategory,
        ServiceCategoryDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateServiceCategoryDto,
        CreateUpdateServiceCategoryDto
    >, IServiceCategoryAppService
    {
        private readonly IRepository<ServiceCategory, Guid> _categoryRepository;

        public ServiceCategoryAppService(IRepository<ServiceCategory, Guid> repository)
            : base(repository)
        {
            _categoryRepository = repository;
        }

        public async Task<List<ServiceCategoryDto>> GetRootCategoriesAsync(Country? country = null)
        {
            var query = await _categoryRepository.GetQueryableAsync();

            query = query.Where(x => x.ParentCategoryId == null && x.IsActive);

            if (country.HasValue)
            {
                query = query.Where(x => x.Country == null || x.Country == country.Value);
            }

            var categories = await AsyncExecuter.ToListAsync(
                query.OrderBy(x => x.DisplayOrder)
            );

            return ObjectMapper.Map<List<ServiceCategory>, List<ServiceCategoryDto>>(categories);
        }

        public async Task<List<ServiceCategoryDto>> GetSubcategoriesAsync(Guid parentId)
        {
            var query = await _categoryRepository.GetQueryableAsync();

            var subcategories = await AsyncExecuter.ToListAsync(
                query.Where(x => x.ParentCategoryId == parentId && x.IsActive)
                    .OrderBy(x => x.DisplayOrder)
            );

            return ObjectMapper.Map<List<ServiceCategory>, List<ServiceCategoryDto>>(subcategories);
        }

        public async Task<List<ServiceCategoryDto>> GetFeaturedCategoriesAsync(Country? country = null)
        {
            var query = await _categoryRepository.GetQueryableAsync();

            query = query.Where(x => x.IsFeatured && x.IsActive);

            if (country.HasValue)
            {
                query = query.Where(x => x.Country == null || x.Country == country.Value);
            }

            var categories = await AsyncExecuter.ToListAsync(
                query.OrderBy(x => x.DisplayOrder)
            );

            return ObjectMapper.Map<List<ServiceCategory>, List<ServiceCategoryDto>>(categories);
        }

        public async Task<List<ServiceCategoryDto>> GetCategoryTreeAsync(Country? country = null)
        {
            var query = await _categoryRepository.GetQueryableAsync();

            query = query.Where(x => x.IsActive);

            if (country.HasValue)
            {
                query = query.Where(x => x.Country == null || x.Country == country.Value);
            }

            var allCategories = await AsyncExecuter.ToListAsync(query);
            var categoryDtos = ObjectMapper.Map<List<ServiceCategory>, List<ServiceCategoryDto>>(allCategories);

            // Build hierarchy - only return root categories, subcategories will be accessed via GetSubcategoriesAsync
            var rootCategories = categoryDtos
                .Where(x => x.ParentCategoryId == null)
                .OrderBy(x => x.DisplayOrder)
                .ToList();

            // Set subcategory count for each root category
            foreach (var root in rootCategories)
            {
                root.SubcategoryCount = categoryDtos.Count(x => x.ParentCategoryId == root.Id);
            }

            return rootCategories;
        }

        public async Task<List<ServiceCategoryDto>> SearchCategoriesAsync(string searchTerm, Country? country = null)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return new List<ServiceCategoryDto>();
            }

            var query = await _categoryRepository.GetQueryableAsync();

            var lowerSearchTerm = searchTerm.ToLower();

            query = query.Where(x => x.IsActive && (
                x.Name.ToLower().Contains(lowerSearchTerm) ||
                (x.NameAr != null && x.NameAr.Contains(searchTerm)) ||
                (x.NameEn != null && x.NameEn.ToLower().Contains(lowerSearchTerm)) ||
                (x.NameFr != null && x.NameFr.ToLower().Contains(lowerSearchTerm)) ||
                (x.Tags != null && x.Tags.ToLower().Contains(lowerSearchTerm))
            ));

            if (country.HasValue)
            {
                query = query.Where(x => x.Country == null || x.Country == country.Value);
            }

            var categories = await AsyncExecuter.ToListAsync(
                query.OrderBy(x => x.DisplayOrder).Take(20)
            );

            return ObjectMapper.Map<List<ServiceCategory>, List<ServiceCategoryDto>>(categories);
        }

        public async Task<ServiceCategoryDto> ToggleFeaturedAsync(Guid id)
        {
            var category = await _categoryRepository.GetAsync(id);
            category.IsFeatured = !category.IsFeatured;
            await _categoryRepository.UpdateAsync(category, autoSave: true);
            return ObjectMapper.Map<ServiceCategory, ServiceCategoryDto>(category);
        }

        public async Task<ServiceCategoryDto> ToggleActiveAsync(Guid id)
        {
            var category = await _categoryRepository.GetAsync(id);
            category.IsActive = !category.IsActive;
            await _categoryRepository.UpdateAsync(category, autoSave: true);
            return ObjectMapper.Map<ServiceCategory, ServiceCategoryDto>(category);
        }
    }
}
