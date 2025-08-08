using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.Payments
{
    public enum PaymentProviderType
    {
        ApplePay,
        AlRajhi,
        Fawry,
        NBEgypt
    }

    public class PaymentRequestDto
    {
        [Required]
        public Guid OrderId { get; set; }
        [Required]
        public decimal Amount { get; set; }
        [Required]
        public PaymentProviderType ProviderType { get; set; }
    }
} 