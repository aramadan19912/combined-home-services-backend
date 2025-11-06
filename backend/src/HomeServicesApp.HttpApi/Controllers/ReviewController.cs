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

        // GET: api/reviews/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var review = await _reviewAppService.GetAsync(id);
            return Ok(review);
        }

        // PUT: api/reviews/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateUpdateReviewDto input)
        {
            var review = await _reviewAppService.UpdateAsync(id, input);
            return Ok(review);
        }

        // DELETE: api/reviews/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _reviewAppService.DeleteAsync(id);
            return NoContent();
        }

        // POST: api/reviews/{id}/helpful
        [HttpPost("{id}/helpful")]
        public async Task<IActionResult> MarkHelpful(Guid id)
        {
            var review = await _reviewAppService.MarkHelpfulAsync(id);
            return Ok(review);
        }

        // POST: api/reviews/{id}/not-helpful
        [HttpPost("{id}/not-helpful")]
        public async Task<IActionResult> MarkNotHelpful(Guid id)
        {
            var review = await _reviewAppService.MarkNotHelpfulAsync(id);
            return Ok(review);
        }

        // POST: api/reviews/{id}/provider-response
        [HttpPost("{id}/provider-response")]
        public async Task<IActionResult> AddProviderResponse(Guid id, [FromBody] ProviderResponseDto input)
        {
            var review = await _reviewAppService.AddProviderResponseAsync(id, input.Response);
            return Ok(review);
        }

        // POST: api/reviews/{id}/moderate
        [HttpPost("{id}/moderate")]
        public async Task<IActionResult> Moderate(Guid id, [FromBody] ModerateReviewDto input)
        {
            var review = await _reviewAppService.ModerateAsync(id, input.Status, input.Notes);
            return Ok(review);
        }

        // POST: api/reviews/{id}/report
        [HttpPost("{id}/report")]
        public async Task<IActionResult> Report(Guid id, [FromBody] ReportReviewDto input)
        {
            await _reviewAppService.ReportAsync(id, input.Reason);
            return NoContent();
        }
    }

    public class ProviderResponseDto
    {
        public string Response { get; set; }
    }

    public class ModerateReviewDto
    {
        public ReviewStatus Status { get; set; }
        public string Notes { get; set; }
    }

    public class ReportReviewDto
    {
        public string Reason { get; set; }
    }
} 