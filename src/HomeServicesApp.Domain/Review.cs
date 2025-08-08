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
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; }

        public Review() { }

        public Review(Guid orderId, Guid userId, Guid? providerId, Guid? serviceId, int rating, string comment)
        {
            OrderId = orderId;
            UserId = userId;
            ProviderId = providerId;
            ServiceId = serviceId;
            Rating = rating;
            Comment = comment;
        }
    }
}  