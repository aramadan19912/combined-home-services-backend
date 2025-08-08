using HomeServicesApp.Payments;
using System;
using System.Threading.Tasks;

namespace HomeServicesApp
{
    public interface IPaymentProvider
    {
        Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
    }

    public class PaymentRequest
    {
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public PaymentProviderType ProviderType { get; set; }
        public string? AdditionalData { get; set; } // بيانات إضافية حسب البوابة
    }

    public class PaymentResult
    {
        public bool Success { get; set; }
        public string? TransactionId { get; set; }
        public string? ErrorMessage { get; set; }
    }
} 