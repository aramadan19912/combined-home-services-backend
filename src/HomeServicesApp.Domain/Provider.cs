using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Provider : FullAuditedAggregateRoot<Guid>
    {
        public Guid UserId { get; set; }
        public string Specialization { get; set; }
        public string Bio { get; set; }
        public double AverageRating { get; set; }
        public int TotalOrders { get; set; }
        public bool IsAvailable { get; set; }
        public decimal WalletBalance { get; set; } // رصيد المحفظة
        public string ApprovalStatus { get; set; } // Pending, Approved, Rejected
        public string IdAttachmentPath { get; set; } // Path to uploaded ID file
        public string CRAttachmentPath { get; set; } // Path to uploaded CR file (optional)
        public string Address { get; set; }
        public string BusinessLicenseAttachmentPath { get; set; }
        public string RejectionReason { get; set; }

        public Provider() { }

        public Provider(Guid userId, string specialization, string bio)
        {
            UserId = userId;
            Specialization = specialization;
            Bio = bio;
            AverageRating = 0;
            TotalOrders = 0;
            IsAvailable = true;
            ApprovalStatus = "Pending";
        }
    }
} 