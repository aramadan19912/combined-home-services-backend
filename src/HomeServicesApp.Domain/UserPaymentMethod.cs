using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class UserPaymentMethod : FullAuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public string MethodType { get; set; } // مثال: Card, Wallet
        public string MaskedDetails { get; set; } // مثال: **** **** **** 1234
        public string? Provider { get; set; } // مثال: Visa, Mada, ApplePay
        public DateTime AddedAt { get; set; }
    }
} 