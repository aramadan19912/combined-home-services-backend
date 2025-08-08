using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class LoyaltyPoint : FullAuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public int Points { get; set; }
        public string Reason { get; set; }
    }
} 