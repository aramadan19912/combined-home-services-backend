using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    /// <summary>
    /// Service image entity for managing multiple images per service
    /// </summary>
    public class ServiceImage : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// Service ID this image belongs to
        /// </summary>
        public Guid ServiceId { get; set; }

        /// <summary>
        /// Image URL
        /// </summary>
        public string ImageUrl { get; set; }

        /// <summary>
        /// Thumbnail URL for faster loading
        /// </summary>
        public string ThumbnailUrl { get; set; }

        /// <summary>
        /// Display order for gallery
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// Whether this is the primary/main image
        /// </summary>
        public bool IsPrimary { get; set; }

        /// <summary>
        /// Image caption or description
        /// </summary>
        public string Caption { get; set; }

        /// <summary>
        /// Alt text for accessibility
        /// </summary>
        public string AltText { get; set; }

        public ServiceImage()
        {
        }

        public ServiceImage(Guid serviceId, string imageUrl, int displayOrder, bool isPrimary = false)
        {
            ServiceId = serviceId;
            ImageUrl = imageUrl;
            DisplayOrder = displayOrder;
            IsPrimary = isPrimary;
        }
    }
}
