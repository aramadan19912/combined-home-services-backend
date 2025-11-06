using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.Invoices
{
    public class InvoiceAppService : CrudAppService<
        Invoice,
        InvoiceDto,
        Guid,
        PagedAndSortedResultRequestDto,
        CreateUpdateInvoiceDto,
        CreateUpdateInvoiceDto
    >, IInvoiceAppService
    {
        private readonly IRepository<Invoice, Guid> _invoiceRepository;

        public InvoiceAppService(IRepository<Invoice, Guid> repository)
            : base(repository)
        {
            _invoiceRepository = repository;
        }

        public override async Task<InvoiceDto> CreateAsync(CreateUpdateInvoiceDto input)
        {
            var invoice = new Invoice
            {
                OrderId = input.OrderId,
                ProviderId = input.ProviderId,
                CustomerId = input.CustomerId,
                Country = input.Country,
                Currency = input.Currency,
                Subtotal = input.Subtotal,
                DiscountAmount = input.DiscountAmount,
                DueDate = input.DueDate,
                Notes = input.Notes,
                IssueDate = DateTime.UtcNow,
                Status = InvoiceStatus.Pending,
                PaidAmount = 0
            };

            // Get regional config for tax calculation
            var config = RegionalConfig.GetConfig(input.Country);
            invoice.TaxRate = config.TaxRate;
            invoice.TaxAmount = input.Subtotal * config.TaxRate;
            invoice.TotalAmount = input.Subtotal + invoice.TaxAmount - input.DiscountAmount;

            // Generate invoice number
            invoice.GenerateInvoiceNumber();

            var created = await _invoiceRepository.InsertAsync(invoice, autoSave: true);
            return ObjectMapper.Map<Invoice, InvoiceDto>(created);
        }

        public async Task<InvoiceDto> GetByOrderIdAsync(Guid orderId)
        {
            var invoice = await _invoiceRepository.FirstOrDefaultAsync(x => x.OrderId == orderId);
            return ObjectMapper.Map<Invoice, InvoiceDto>(invoice);
        }

        public async Task<PagedResultDto<InvoiceDto>> GetByProviderIdAsync(
            Guid providerId,
            PagedAndSortedResultRequestDto input)
        {
            var query = await _invoiceRepository.GetQueryableAsync();
            query = query.Where(x => x.ProviderId == providerId);

            var totalCount = await AsyncExecuter.CountAsync(query);

            var items = await AsyncExecuter.ToListAsync(
                query.OrderByDescending(x => x.IssueDate)
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );

            return new PagedResultDto<InvoiceDto>(
                totalCount,
                ObjectMapper.Map<System.Collections.Generic.List<Invoice>, System.Collections.Generic.List<InvoiceDto>>(items)
            );
        }

        public async Task<PagedResultDto<InvoiceDto>> GetByCustomerIdAsync(
            Guid customerId,
            PagedAndSortedResultRequestDto input)
        {
            var query = await _invoiceRepository.GetQueryableAsync();
            query = query.Where(x => x.CustomerId == customerId);

            var totalCount = await AsyncExecuter.CountAsync(query);

            var items = await AsyncExecuter.ToListAsync(
                query.OrderByDescending(x => x.IssueDate)
                    .Skip(input.SkipCount)
                    .Take(input.MaxResultCount)
            );

            return new PagedResultDto<InvoiceDto>(
                totalCount,
                ObjectMapper.Map<System.Collections.Generic.List<Invoice>, System.Collections.Generic.List<InvoiceDto>>(items)
            );
        }

        public async Task<InvoiceDto> MarkAsPaidAsync(Guid id, decimal paidAmount)
        {
            var invoice = await _invoiceRepository.GetAsync(id);

            invoice.PaidAmount += paidAmount;

            if (invoice.PaidAmount >= invoice.TotalAmount)
            {
                invoice.Status = InvoiceStatus.Paid;
                invoice.PaidDate = DateTime.UtcNow;
            }

            await _invoiceRepository.UpdateAsync(invoice, autoSave: true);
            return ObjectMapper.Map<Invoice, InvoiceDto>(invoice);
        }

        public async Task<InvoiceDto> CancelAsync(Guid id)
        {
            var invoice = await _invoiceRepository.GetAsync(id);
            invoice.Status = InvoiceStatus.Cancelled;
            await _invoiceRepository.UpdateAsync(invoice, autoSave: true);
            return ObjectMapper.Map<Invoice, InvoiceDto>(invoice);
        }

        public async Task<byte[]> GeneratePdfAsync(Guid id)
        {
            // TODO: Implement PDF generation using a library like QuestPDF or iTextSharp
            // For now, return empty byte array as placeholder
            var invoice = await _invoiceRepository.GetAsync(id);

            // Placeholder: In production, use PDF generation library
            var pdfContent = System.Text.Encoding.UTF8.GetBytes(
                $"Invoice: {invoice.InvoiceNumber}\nTotal: {invoice.TotalAmount}"
            );

            return pdfContent;
        }
    }
}
