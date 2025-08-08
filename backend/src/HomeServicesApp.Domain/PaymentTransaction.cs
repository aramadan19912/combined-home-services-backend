using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class PaymentTransaction : FullAuditedAggregateRoot<Guid>
    {
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } // مثال: ApplePay, AlRajhi, Fawry, NBEgypt
        public string TransactionStatus { get; set; } // مثال: Pending, Success, Failed
        public string? ProviderTransactionId { get; set; } // رقم العملية من بوابة الدفع
        public DateTime TransactionDate { get; set; }
        public string? Notes { get; set; }
    }
} 