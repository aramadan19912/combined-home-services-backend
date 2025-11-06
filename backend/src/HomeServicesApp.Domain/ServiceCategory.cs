using System;
using System.Collections.Generic;
using HomeServicesApp.RegionalSettings;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    /// <summary>
    /// Service Category entity supporting hierarchical categories
    /// </summary>
    public class ServiceCategory : FullAuditedAggregateRoot<Guid>
    {
        /// <summary>
        /// Category name in default language
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Category name in Arabic
        /// </summary>
        public string NameAr { get; set; }

        /// <summary>
        /// Category name in English
        /// </summary>
        public string NameEn { get; set; }

        /// <summary>
        /// Category name in French
        /// </summary>
        public string NameFr { get; set; }

        /// <summary>
        /// Category description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Category description in Arabic
        /// </summary>
        public string DescriptionAr { get; set; }

        /// <summary>
        /// Category description in English
        /// </summary>
        public string DescriptionEn { get; set; }

        /// <summary>
        /// Category description in French
        /// </summary>
        public string DescriptionFr { get; set; }

        /// <summary>
        /// Parent category ID for hierarchical categories
        /// </summary>
        public Guid? ParentCategoryId { get; set; }

        /// <summary>
        /// Icon URL for the category
        /// </summary>
        public string IconUrl { get; set; }

        /// <summary>
        /// Image URL for the category
        /// </summary>
        public string ImageUrl { get; set; }

        /// <summary>
        /// Display order for sorting
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// Whether this category is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Whether this category is featured on homepage
        /// </summary>
        public bool IsFeatured { get; set; }

        /// <summary>
        /// Country-specific category (null means available in all countries)
        /// </summary>
        public Country? Country { get; set; }

        /// <summary>
        /// Comma-separated tags for better search
        /// </summary>
        public string Tags { get; set; }

        public ServiceCategory()
        {
            IsActive = true;
            IsFeatured = false;
        }

        public ServiceCategory(string name, string nameAr, string nameEn, string description)
        {
            Name = name;
            NameAr = nameAr;
            NameEn = nameEn;
            Description = description;
            IsActive = true;
            IsFeatured = false;
        }

        /// <summary>
        /// Get localized name based on locale
        /// </summary>
        public string GetLocalizedName(string locale)
        {
            return locale?.ToLower() switch
            {
                "ar" or "ar-sa" or "ar-eg" => NameAr ?? Name,
                "fr" or "fr-fr" => NameFr ?? NameEn ?? Name,
                "en" or "en-us" => NameEn ?? Name,
                _ => Name
            };
        }

        /// <summary>
        /// Get localized description based on locale
        /// </summary>
        public string GetLocalizedDescription(string locale)
        {
            return locale?.ToLower() switch
            {
                "ar" or "ar-sa" or "ar-eg" => DescriptionAr ?? Description,
                "fr" or "fr-fr" => DescriptionFr ?? DescriptionEn ?? Description,
                "en" or "en-us" => DescriptionEn ?? Description,
                _ => Description
            };
        }
    }
}
