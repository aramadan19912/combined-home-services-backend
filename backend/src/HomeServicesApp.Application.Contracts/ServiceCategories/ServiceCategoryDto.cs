using System;
using Volo.Abp.Application.Dtos;
using HomeServicesApp.RegionalSettings;

namespace HomeServicesApp.ServiceCategories
{
    public class ServiceCategoryDto : FullAuditedEntityDto<Guid>
    {
        public string Name { get; set; }
        public string NameAr { get; set; }
        public string NameEn { get; set; }
        public string NameFr { get; set; }
        public string Description { get; set; }
        public string DescriptionAr { get; set; }
        public string DescriptionEn { get; set; }
        public string DescriptionFr { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public string IconUrl { get; set; }
        public string ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public Country? Country { get; set; }
        public string Tags { get; set; }

        // Additional properties for frontend display
        public string ParentCategoryName { get; set; }
        public int SubcategoryCount { get; set; }
    }
}
