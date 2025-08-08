using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using HomeServicesApp.Orders;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Controllers
{
    [Route("api/order")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderAppService _orderAppService;
        public OrderController(IOrderAppService orderAppService)
        {
            _orderAppService = orderAppService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdateOrderDto input)
        {
            var result = await _orderAppService.CreateAsync(input);
            return Ok(result);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings([FromQuery] PagedAndSortedResultRequestDto input)
        {
            // Optionally, filter by current user in the service
            var result = await _orderAppService.GetListAsync(input);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateUpdateOrderDto input)
        {
            var result = await _orderAppService.UpdateAsync(id, input);
            return Ok(result);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            // Assume CancelAsync exists or is stubbed in IOrderAppService
            await _orderAppService.CancelAsync(id);
            return Ok();
        }

        [HttpPost("{id}/accept")]
        public async Task<IActionResult> Accept(Guid id)
        {
            await _orderAppService.AcceptAsync(id);
            return Ok();
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            await _orderAppService.CompleteAsync(id);
            return Ok();
        }
    }
} 