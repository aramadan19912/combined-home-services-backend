using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace HomeServicesApp.Invoices
{
    public interface IInvoiceAppService : ICrudAppService<
        InvoiceDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateInvoiceDto,
        CreateUpdateInvoiceDto>
    {
        Task<InvoiceDto> GetByOrderIdAsync(Guid orderId);
        Task<PagedResultDto<InvoiceDto>> GetByProviderIdAsync(Guid providerId, PagedAndSortedResultRequestDto input);
        Task<PagedResultDto<InvoiceDto>> GetByCustomerIdAsync(Guid customerId, PagedAndSortedResultRequestDto input);
        Task<InvoiceDto> MarkAsPaidAsync(Guid id, decimal paidAmount);
        Task<InvoiceDto> CancelAsync(Guid id);
        Task<byte[]> GeneratePdfAsync(Guid id);
    }
}
