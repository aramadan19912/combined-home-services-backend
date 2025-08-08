using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Complaint : FullAuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public string Message { get; set; }
        public string Status { get; set; } // جديد، جارٍ المعالجة، مغلق
        public string AdminReply { get; set; }
        public string AttachmentPath { get; set; } // Path to uploaded file
        public bool IsEscalated { get; set; }
        public string EscalationReason { get; set; }
        public Guid? AssignedAdminId { get; set; }
        public Complaint(Guid id) : base(id) {}
    }
} 