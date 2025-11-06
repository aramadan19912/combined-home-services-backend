using System;
using System.ComponentModel.DataAnnotations;

namespace HomeServicesApp.ServiceImages
{
    public class CreateUpdateServiceImageDto
    {
        [Required]
        public Guid ServiceId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string ImageUrl { get; set; }

        [MaxLength(1000)]
        public string ThumbnailUrl { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsPrimary { get; set; }

        [MaxLength(500)]
        public string Caption { get; set; }

        [MaxLength(200)]
        public string AltText { get; set; }
    }
}
