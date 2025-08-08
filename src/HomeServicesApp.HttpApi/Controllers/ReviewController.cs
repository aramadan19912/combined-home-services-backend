using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using HomeServicesApp.Reviews;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using System.Linq;

namespace HomeServicesApp.Controllers
{
    [Route("api/reviews")]
    [ApiController]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewAppService _reviewAppService;
        public ReviewController(IReviewAppService reviewAppService)
        {
            _reviewAppService = reviewAppService;
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdateReviewDto input)
        {
            var result = await _reviewAppService.CreateAsync(input);
            return Ok(result);
        }

        // GET: api/reviews/by-order/{orderId}
        [HttpGet("by-order/{orderId}")]
        public async Task<IActionResult> GetByOrder(Guid orderId)
        {
            var reviews = await _reviewAppService.GetListAsync(new PagedAndSortedResultRequestDto { MaxResultCount = 1000 });
            var filtered = reviews.Items.Where(r => r.OrderId == orderId);
            return Ok(filtered);
        }

        // GET: api/reviews/by-provider/{providerId}
        [HttpGet("by-provider/{providerId}")]
        public async Task<IActionResult> GetByProvider(Guid providerId)
        {
            var reviews = await _reviewAppService.GetListAsync(new PagedAndSortedResultRequestDto { MaxResultCount = 1000 });
            var filtered = reviews.Items.Where(r => r.ProviderId == providerId);
            return Ok(filtered);
        }
    }
} 