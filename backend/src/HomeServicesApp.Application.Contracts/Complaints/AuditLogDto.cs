using System;

namespace HomeServicesApp.Complaints
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public Guid ComplaintId { get; set; }
        public string Action { get; set; }
        public Guid? UserId { get; set; }
        public string Details { get; set; }
        public DateTime CreationTime { get; set; }
    }
} 