using System.Collections.Generic;
using System.Threading.Tasks;
using HomeServicesApp.Categories;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace HomeServicesApp.Controllers
{
    [Route("api/app/categories")]
    public class CategoryController : AbpControllerBase
    {
        private readonly ICategoryAppService _categoryAppService;

        public CategoryController(ICategoryAppService categoryAppService)
        {
            _categoryAppService = categoryAppService;
        }

        [HttpGet]
        public async Task<List<CategoryDto>> GetAllAsync()
        {
            return await _categoryAppService.GetAllCategoriesAsync();
        }

        [HttpGet("{name}")]
        public async Task<CategoryDto> GetByNameAsync(string name)
        {
            return await _categoryAppService.GetCategoryByNameAsync(name);
        }

        [HttpGet("popular/{count}")]
        public async Task<List<CategoryDto>> GetPopularAsync(int count)
        {
            return await _categoryAppService.GetPopularCategoriesAsync(count);
        }
    }
}
