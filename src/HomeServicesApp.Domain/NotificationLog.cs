using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class NotificationLog : FullAuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public string Data { get; set; }
        public bool IsRead { get; set; }
    }
} 