using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class WithdrawalRequest : FullAuditedAggregateRoot<Guid>
    {
        public Guid ProviderId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } // جديد، مقبول، مرفوض
        public DateTime RequestDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
    }
} 