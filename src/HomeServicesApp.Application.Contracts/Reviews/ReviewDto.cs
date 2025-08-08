using System;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.Reviews
{
    public class ReviewDto : FullAuditedEntityDto<Guid>
    {
        public Guid OrderId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ProviderId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
} 