using System;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.Invoices
{
    public class InvoiceDto : EntityDto<Guid>
    {
        public string InvoiceNumber { get; set; }
        public Guid OrderId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid CustomerId { get; set; }

        public Country Country { get; set; }
        public Currency Currency { get; set; }

        public decimal Subtotal { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }

        public InvoiceStatus Status { get; set; }

        public DateTime IssueDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? PaidDate { get; set; }

        public string Notes { get; set; }

        // Navigation properties (for display)
        public string ProviderName { get; set; }
        public string CustomerName { get; set; }
        public string OrderNumber { get; set; }
    }

    public enum InvoiceStatus
    {
        Pending = 1,
        Paid = 2,
        Overdue = 3,
        Cancelled = 4
    }
}
