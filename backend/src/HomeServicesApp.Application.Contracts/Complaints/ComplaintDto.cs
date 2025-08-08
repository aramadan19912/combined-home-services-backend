using System;

namespace HomeServicesApp.Complaints
{
    public class ComplaintDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public string AdminReply { get; set; }
        public DateTime CreationTime { get; set; }
        public string AttachmentPath { get; set; }
        public bool IsEscalated { get; set; }
        public string EscalationReason { get; set; }
        public Guid? AssignedAdminId { get; set; }
    }
} 