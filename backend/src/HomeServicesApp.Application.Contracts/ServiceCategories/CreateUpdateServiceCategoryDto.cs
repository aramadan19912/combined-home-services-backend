using System;
using System.ComponentModel.DataAnnotations;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.ServiceCategories
{
    public class CreateUpdateServiceCategoryDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(200)]
        public string NameAr { get; set; }

        [MaxLength(200)]
        public string NameEn { get; set; }

        [MaxLength(200)]
        public string NameFr { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [MaxLength(1000)]
        public string DescriptionAr { get; set; }

        [MaxLength(1000)]
        public string DescriptionEn { get; set; }

        [MaxLength(1000)]
        public string DescriptionFr { get; set; }

        public Guid? ParentCategoryId { get; set; }

        [MaxLength(500)]
        public string IconUrl { get; set; }

        [MaxLength(500)]
        public string ImageUrl { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }

        public bool IsFeatured { get; set; }

        public Country? Country { get; set; }

        [MaxLength(500)]
        public string Tags { get; set; }
    }
}
