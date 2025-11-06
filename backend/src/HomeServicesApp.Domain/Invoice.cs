using System;
using HomeServicesApp.RegionalSettings;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    /// <summary>
    /// Invoice entity for tax-compliant invoicing
    /// </summary>
    public class Invoice : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// Invoice number (unique, sequential)
        /// </summary>
        public string InvoiceNumber { get; set; }

        /// <summary>
        /// Order ID this invoice belongs to
        /// </summary>
        public Guid OrderId { get; set; }

        /// <summary>
        /// Customer/User ID
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Provider ID
        /// </summary>
        public Guid? ProviderId { get; set; }

        /// <summary>
        /// Invoice date
        /// </summary>
        public DateTime InvoiceDate { get; set; }

        /// <summary>
        /// Due date for payment
        /// </summary>
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// Country for tax compliance
        /// </summary>
        public Country Country { get; set; }

        /// <summary>
        /// Currency
        /// </summary>
        public Currency Currency { get; set; }

        /// <summary>
        /// Service/Item description
        /// </summary>
        public string ItemDescription { get; set; }

        /// <summary>
        /// Base amount before tax
        /// </summary>
        public decimal SubTotal { get; set; }

        /// <summary>
        /// Tax rate applied (0.15 for SA, 0.14 for EG)
        /// </summary>
        public decimal TaxRate { get; set; }

        /// <summary>
        /// Tax amount
        /// </summary>
        public decimal TaxAmount { get; set; }

        /// <summary>
        /// Platform fee
        /// </summary>
        public decimal PlatformFee { get; set; }

        /// <summary>
        /// Discount amount
        /// </summary>
        public decimal DiscountAmount { get; set; }

        /// <summary>
        /// Total amount including tax
        /// </summary>
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// Amount paid so far
        /// </summary>
        public decimal PaidAmount { get; set; }

        /// <summary>
        /// Balance due
        /// </summary>
        public decimal Balance { get; set; }

        /// <summary>
        /// Invoice status
        /// </summary>
        public InvoiceStatus Status { get; set; }

        /// <summary>
        /// Customer name
        /// </summary>
        public string CustomerName { get; set; }

        /// <summary>
        /// Customer email
        /// </summary>
        public string CustomerEmail { get; set; }

        /// <summary>
        /// Customer phone
        /// </summary>
        public string CustomerPhone { get; set; }

        /// <summary>
        /// Customer address
        /// </summary>
        public string CustomerAddress { get; set; }

        /// <summary>
        /// Customer tax ID/VAT number (if applicable)
        /// </summary>
        public string CustomerTaxId { get; set; }

        /// <summary>
        /// Provider/Company name
        /// </summary>
        public string ProviderName { get; set; }

        /// <summary>
        /// Provider tax ID/VAT number
        /// </summary>
        public string ProviderTaxId { get; set; }

        /// <summary>
        /// Provider address
        /// </summary>
        public string ProviderAddress { get; set; }

        /// <summary>
        /// PDF file path
        /// </summary>
        public string PdfPath { get; set; }

        /// <summary>
        /// Notes or terms
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// Digital signature or stamp
        /// </summary>
        public string DigitalSignature { get; set; }

        public Invoice()
        {
            InvoiceDate = DateTime.UtcNow;
            Status = InvoiceStatus.Draft;
        }

        public Invoice(Guid orderId, Guid userId, Country country, Currency currency, decimal subTotal, decimal taxRate)
        {
            OrderId = orderId;
            UserId = userId;
            Country = country;
            Currency = currency;
            SubTotal = subTotal;
            TaxRate = taxRate;
            InvoiceDate = DateTime.UtcNow;
            Status = InvoiceStatus.Draft;

            CalculateAmounts();
        }

        /// <summary>
        /// Calculate all amounts based on subtotal and tax rate
        /// </summary>
        public void CalculateAmounts()
        {
            TaxAmount = SubTotal * TaxRate;
            TotalAmount = SubTotal + TaxAmount + PlatformFee - DiscountAmount;
            Balance = TotalAmount - PaidAmount;
        }

        /// <summary>
        /// Generate invoice number based on country and date
        /// </summary>
        public void GenerateInvoiceNumber()
        {
            var countryCode = Country == Country.SaudiArabia ? "SA" : "EG";
            var dateCode = InvoiceDate.ToString("yyyyMMdd");
            var random = new Random().Next(1000, 9999);
            InvoiceNumber = $"INV-{countryCode}-{dateCode}-{random}";
        }

        /// <summary>
        /// Mark invoice as paid
        /// </summary>
        public void MarkAsPaid(decimal amount)
        {
            PaidAmount += amount;
            CalculateAmounts();

            if (Balance <= 0)
            {
                Status = InvoiceStatus.Paid;
            }
            else if (PaidAmount > 0)
            {
                Status = InvoiceStatus.PartiallyPaid;
            }
        }

        /// <summary>
        /// Mark invoice as sent to customer
        /// </summary>
        public void MarkAsSent()
        {
            if (Status == InvoiceStatus.Draft)
            {
                Status = InvoiceStatus.Sent;
            }
        }

        /// <summary>
        /// Mark invoice as void/cancelled
        /// </summary>
        public void MarkAsVoid()
        {
            Status = InvoiceStatus.Void;
        }
    }

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
