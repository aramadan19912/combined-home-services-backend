using System;
using System.ComponentModel.DataAnnotations;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.Invoices
{
    public class CreateUpdateInvoiceDto
    {
        [Required]
        public Guid OrderId { get; set; }

        public Guid? ProviderId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Country Country { get; set; }

        [Required]
        public Currency Currency { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal SubTotal { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PlatformFee { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DiscountAmount { get; set; }

        public DateTime? DueDate { get; set; }

        public string ItemDescription { get; set; }

        [MaxLength(1000)]
        public string Notes { get; set; }
    }
}
