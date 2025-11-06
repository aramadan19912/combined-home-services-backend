using System;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Reviews
{
    public class ReviewDto : FullAuditedEntityDto<Guid>
    {
        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ProviderId { get; set; }
        public Guid? ServiceId { get; set; }

        // Overall rating
        public int Rating { get; set; }

        // Detailed ratings
        public int? ServiceQualityRating { get; set; }
        public int? ProfessionalismRating { get; set; }
        public int? PunctualityRating { get; set; }
        public int? ValueRating { get; set; }

        public string Comment { get; set; }
        public string ImageUrls { get; set; }

        // Moderation
        public ReviewStatus Status { get; set; }
        public bool IsVerified { get; set; }
        public bool IsAnonymous { get; set; }

        // Provider response
        public string ProviderResponse { get; set; }
        public DateTime? ProviderResponseDate { get; set; }

        // Helpfulness
        public int HelpfulCount { get; set; }
        public int NotHelpfulCount { get; set; }

        // Moderation
        public string ModerationNotes { get; set; }
    }

    public enum ReviewStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Flagged = 4
    }
}
