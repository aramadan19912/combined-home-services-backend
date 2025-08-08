using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class AuditLog : FullAuditedAggregateRoot<Guid>
    {
        public Guid ComplaintId { get; set; }
        public string Action { get; set; }
        public Guid? UserId { get; set; }
        public string Details { get; set; }
    }
} 