using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc;
using HomeServicesApp.Payments;
using System;
using Microsoft.AspNetCore.Authorization;

namespace HomeServicesApp.Controllers
{
    [Route("api/payments")]
    public class PaymentController : AbpController
    {
        private readonly PaymentAppService _paymentAppService;
        private readonly UserPaymentMethodAppService _userPaymentMethodAppService;
        public PaymentController(PaymentAppService paymentAppService, UserPaymentMethodAppService userPaymentMethodAppService)
        {
            _paymentAppService = paymentAppService;
            _userPaymentMethodAppService = userPaymentMethodAppService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Pay([FromBody] PaymentRequestDto dto)
        {
            var result = await _paymentAppService.PayAsync(dto.OrderId, dto.Amount, dto.ProviderType);
            if (result)
                return Ok(new { success = true });
            return BadRequest(new { success = false });
        }

        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetByOrder(Guid orderId)
        {
            var result = await _paymentAppService.GetTransactionsByOrderAsync(orderId);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _paymentAppService.GetAllTransactionsAsync();
            return Ok(result);
        }

        [HttpGet("status/{orderId}")]
        public async Task<IActionResult> GetOrderPaymentStatus(Guid orderId)
        {
            var result = await _paymentAppService.GetOrderPaymentStatusAsync(orderId);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("refund/{transactionId}")]
        public async Task<IActionResult> Refund(Guid transactionId)
        {
            var result = await _paymentAppService.RefundTransactionAsync(transactionId);
            if (result)
                return Ok(new { success = true });
            return BadRequest(new { success = false });
        }

        [HttpGet("receipt/{transactionId}")]
        public async Task<IActionResult> GetReceipt(Guid transactionId)
        {
            var pdfBytes = await _paymentAppService.GenerateReceiptPdfAsync(transactionId);
            if (pdfBytes == null)
                return NotFound();
            return File(pdfBytes, "application/pdf", $"receipt_{transactionId}.pdf");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("retry/{transactionId}")]
        public async Task<IActionResult> Retry(Guid transactionId)
        {
            var result = await _paymentAppService.RetryPaymentAsync(transactionId);
            if (result)
                return Ok(new { success = true });
            return BadRequest(new { success = false });
        }

        public class RefundPartialDto
        {
            public decimal Amount { get; set; }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("refund-partial/{transactionId}")]
        public async Task<IActionResult> RefundPartial(Guid transactionId, [FromBody] RefundPartialDto dto)
        {
            var result = await _paymentAppService.RefundPartialTransactionAsync(transactionId, dto.Amount);
            if (result)
                return Ok(new { success = true });
            return BadRequest(new { success = false });
        }

        [HttpGet("methods")]
        public async Task<IActionResult> GetMethods()
        {
            var result = await _userPaymentMethodAppService.GetListAsync();
            return Ok(result);
        }

        [HttpPost("methods")]
        public async Task<IActionResult> AddMethod([FromBody] CreateUpdateUserPaymentMethodDto dto)
        {
            var result = await _userPaymentMethodAppService.CreateAsync(dto);
            return Ok(result);
        }

        [HttpDelete("methods/{methodId}")]
        public async Task<IActionResult> DeleteMethod(Guid methodId)
        {
            await _userPaymentMethodAppService.DeleteAsync(methodId);
            return NoContent();
        }
    }
} 