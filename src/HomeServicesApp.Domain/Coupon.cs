using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Coupon : FullAuditedAggregateRoot<Guid>
    {
        public string Code { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int UsageCount { get; set; }
        public int MaxUsage { get; set; }
        public bool IsActive { get; set; }
    }
} 