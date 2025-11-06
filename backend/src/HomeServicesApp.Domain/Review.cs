using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Review : FullAuditedAggregateRoot<Guid>
    {
        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ProviderId { get; set; }
        public Guid? ServiceId { get; set; }

        /// <summary>
        /// Overall rating (1-5 stars)
        /// </summary>
        public int Rating { get; set; }

        /// <summary>
        /// Service quality rating (1-5)
        /// </summary>
        public int? ServiceQualityRating { get; set; }

        /// <summary>
        /// Professionalism rating (1-5)
        /// </summary>
        public int? ProfessionalismRating { get; set; }

        /// <summary>
        /// Punctuality rating (1-5)
        /// </summary>
        public int? PunctualityRating { get; set; }

        /// <summary>
        /// Value for money rating (1-5)
        /// </summary>
        public int? ValueRating { get; set; }

        public string Comment { get; set; }

        /// <summary>
        /// Comma-separated image URLs attached to review
        /// </summary>
        public string ImageUrls { get; set; }

        /// <summary>
        /// Review status for moderation
        /// </summary>
        public ReviewStatus Status { get; set; }

        /// <summary>
        /// Whether review is verified (from actual order completion)
        /// </summary>
        public bool IsVerified { get; set; }

        /// <summary>
        /// Whether reviewer is anonymous
        /// </summary>
        public bool IsAnonymous { get; set; }

        /// <summary>
        /// Provider response to review
        /// </summary>
        public string ProviderResponse { get; set; }

        /// <summary>
        /// When provider responded
        /// </summary>
        public DateTime? ProviderResponseDate { get; set; }

        /// <summary>
        /// Number of users who found this review helpful
        /// </summary>
        public int HelpfulCount { get; set; }

        /// <summary>
        /// Number of users who did not find this review helpful
        /// </summary>
        public int NotHelpfulCount { get; set; }

        /// <summary>
        /// Moderation notes from admin
        /// </summary>
        public string ModerationNotes { get; set; }

        /// <summary>
        /// When review was moderated
        /// </summary>
        public DateTime? ModeratedAt { get; set; }

        /// <summary>
        /// Admin/moderator who approved/rejected
        /// </summary>
        public Guid? ModeratedBy { get; set; }

        public Review()
        {
            Status = ReviewStatus.Pending;
            IsVerified = true;
            IsAnonymous = false;
        }

        public Review(Guid orderId, Guid userId, Guid? providerId, Guid? serviceId, int rating, string comment)
        {
            OrderId = orderId;
            UserId = userId;
            ProviderId = providerId;
            ServiceId = serviceId;
            Rating = rating;
            Comment = comment;
            Status = ReviewStatus.Pending;
            IsVerified = true;
            IsAnonymous = false;
        }

        public void Approve(Guid? moderatorId = null, string notes = null)
        {
            Status = ReviewStatus.Approved;
            ModeratedAt = DateTime.UtcNow;
            ModeratedBy = moderatorId;
            ModerationNotes = notes;
        }

        public void Reject(Guid moderatorId, string reason)
        {
            Status = ReviewStatus.Rejected;
            ModeratedAt = DateTime.UtcNow;
            ModeratedBy = moderatorId;
            ModerationNotes = reason;
        }

        public void Flag(string reason)
        {
            Status = ReviewStatus.Flagged;
            ModerationNotes = reason;
        }

        public void AddProviderResponse(string response)
        {
            ProviderResponse = response;
            ProviderResponseDate = DateTime.UtcNow;
        }
    }

    public enum ReviewStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Flagged = 4
    }
}
  