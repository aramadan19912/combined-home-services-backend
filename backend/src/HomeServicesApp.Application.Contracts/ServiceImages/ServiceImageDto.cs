using System;
using Volo.Abp.Application.Dtos;

namespace HomeServicesApp.ServiceImages
{
    public class ServiceImageDto : FullAuditedEntityDto<Guid>
    {
        public Guid ServiceId { get; set; }
        public string ImageUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
        public string Caption { get; set; }
        public string AltText { get; set; }
    }
}
