using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.Invoices;

namespace HomeServicesApp.Controllers
{
    [Area("app")]
    [RemoteService(Name = "app")]
    [Route("api/invoice")]
    public class InvoiceController : HomeServicesAppController
    {
        private readonly IInvoiceAppService _invoiceAppService;

        public InvoiceController(IInvoiceAppService invoiceAppService)
        {
            _invoiceAppService = invoiceAppService;
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<InvoiceDto> GetAsync(Guid id)
        {
            return await _invoiceAppService.GetAsync(id);
        }

        [HttpGet]
        [Route("")]
        public async Task<PagedResultDto<InvoiceDto>> GetListAsync([FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _invoiceAppService.GetListAsync(input);
        }

        [HttpPost]
        [Route("")]
        public async Task<InvoiceDto> CreateAsync([FromBody] CreateUpdateInvoiceDto input)
        {
            return await _invoiceAppService.CreateAsync(input);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<InvoiceDto> UpdateAsync(Guid id, [FromBody] CreateUpdateInvoiceDto input)
        {
            return await _invoiceAppService.UpdateAsync(id, input);
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _invoiceAppService.DeleteAsync(id);
        }

        [HttpGet]
        [Route("by-order/{orderId}")]
        public async Task<InvoiceDto> GetByOrderIdAsync(Guid orderId)
        {
            return await _invoiceAppService.GetByOrderIdAsync(orderId);
        }

        [HttpGet]
        [Route("by-provider/{providerId}")]
        public async Task<PagedResultDto<InvoiceDto>> GetByProviderIdAsync(
            Guid providerId,
            [FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _invoiceAppService.GetByProviderIdAsync(providerId, input);
        }

        [HttpGet]
        [Route("by-customer/{customerId}")]
        public async Task<PagedResultDto<InvoiceDto>> GetByCustomerIdAsync(
            Guid customerId,
            [FromQuery] PagedAndSortedResultRequestDto input)
        {
            return await _invoiceAppService.GetByCustomerIdAsync(customerId, input);
        }

        [HttpPost]
        [Route("{id}/mark-paid")]
        public async Task<InvoiceDto> MarkAsPaidAsync(Guid id, [FromBody] decimal paidAmount)
        {
            return await _invoiceAppService.MarkAsPaidAsync(id, paidAmount);
        }

        [HttpPost]
        [Route("{id}/cancel")]
        public async Task<InvoiceDto> CancelAsync(Guid id)
        {
            return await _invoiceAppService.CancelAsync(id);
        }

        [HttpGet]
        [Route("{id}/pdf")]
        public async Task<IActionResult> GeneratePdfAsync(Guid id)
        {
            var pdfBytes = await _invoiceAppService.GeneratePdfAsync(id);
            return File(pdfBytes, "application/pdf", $"invoice-{id}.pdf");
        }
    }
}
