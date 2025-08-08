using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using HomeServicesApp.Services;
using Volo.Abp.Application.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace HomeServicesApp.Controllers
{
    [Route("api/service")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceAppService _serviceAppService;
        public ServiceController(IServiceAppService serviceAppService)
        {
            _serviceAppService = serviceAppService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> PublicSearch([FromQuery] string query = null, [FromQuery] string category = null)
        {
            var all = await _serviceAppService.GetListAsync(new PagedAndSortedResultRequestDto { MaxResultCount = 1000 });
            var filtered = all.Items.Where(s =>
                (string.IsNullOrEmpty(query) || (s.Name != null && s.Name.Contains(query, StringComparison.OrdinalIgnoreCase)) || (s.Description != null && s.Description.Contains(query, StringComparison.OrdinalIgnoreCase))) &&
                (string.IsNullOrEmpty(category) || (s.Category != null && s.Category.Equals(category, StringComparison.OrdinalIgnoreCase)))
            ).ToList();
            return Ok(filtered);
        }
    }
} 