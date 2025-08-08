using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Services;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace HomeServicesApp.Categories
{
    [Authorize]
    public class CategoryAppService : ApplicationService, ICategoryAppService
    {
        private readonly IRepository<Service, Guid> _serviceRepository;

        public CategoryAppService(IRepository<Service, Guid> serviceRepository)
        {
            _serviceRepository = serviceRepository;
        }

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            var services = await _serviceRepository.GetListAsync();
            var categories = services
                .GroupBy(s => s.Category)
                .Select(g => new CategoryDto
                {
                    Name = g.Key,
                    ServiceCount = g.Count(),
                    Description = $"Services in {g.Key} category"
                })
                .ToList();

            return categories;
        }

        public async Task<CategoryDto> GetCategoryByNameAsync(string name)
        {
            var services = await _serviceRepository.GetListAsync(x => x.Category == name);
            return new CategoryDto
            {
                Name = name,
                ServiceCount = services.Count,
                Description = $"Services in {name} category"
            };
        }

        public async Task<List<CategoryDto>> GetPopularCategoriesAsync(int count)
        {
            var categories = await GetAllCategoriesAsync();
            return categories.OrderByDescending(c => c.ServiceCount).Take(count).ToList();
        }
    }

    public interface ICategoryAppService
    {
        Task<List<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> GetCategoryByNameAsync(string name);
        Task<List<CategoryDto>> GetPopularCategoriesAsync(int count);
    }

    public class CategoryDto
    {
        public string Name { get; set; }
        public int ServiceCount { get; set; }
        public string Description { get; set; }
        public string IconUrl { get; set; }
    }
}
