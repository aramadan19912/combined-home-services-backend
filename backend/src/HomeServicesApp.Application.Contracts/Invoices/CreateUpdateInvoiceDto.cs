using System;
using System.ComponentModel.DataAnnotations;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.Invoices
{
    public class CreateUpdateInvoiceDto
    {
        [Required]
        public Guid OrderId { get; set; }

        [Required]
        public Guid ProviderId { get; set; }

        [Required]
        public Guid CustomerId { get; set; }

        [Required]
        public Country Country { get; set; }

        [Required]
        public Currency Currency { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Subtotal { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DiscountAmount { get; set; }

        public DateTime? DueDate { get; set; }

        [MaxLength(1000)]
        public string Notes { get; set; }
    }
}
