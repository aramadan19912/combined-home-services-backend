using System;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.Invoices
{
    public class InvoiceDto : EntityDto<Guid>
    {
        public string InvoiceNumber { get; set; }
        public Guid OrderId { get; set; }
        public Guid? ProviderId { get; set; }
        public Guid UserId { get; set; }

        public Country Country { get; set; }
        public Currency Currency { get; set; }

        public decimal SubTotal { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal PlatformFee { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal Balance { get; set; }

        public InvoiceStatus Status { get; set; }

        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }

        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public string CustomerTaxId { get; set; }

        public string ProviderName { get; set; }
        public string ProviderTaxId { get; set; }
        public string ProviderAddress { get; set; }

        public string ItemDescription { get; set; }
        public string Notes { get; set; }
        public string PdfPath { get; set; }
        public string DigitalSignature { get; set; }
    }

    // Use the domain enum - no need to redefine
    public enum InvoiceStatus
    {
        Draft = 1,
        Sent = 2,
        PartiallyPaid = 3,
        Paid = 4,
        Overdue = 5,
        Void = 6
    }
}
