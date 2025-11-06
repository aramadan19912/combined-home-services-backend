using System;
using HomeServicesApp.RegionalSettings;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Service : FullAuditedAggregateRoot<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public decimal Price { get; set; }

        /// <summary>
        /// Currency for the service price (SAR, EGP, etc.)
        /// </summary>
        public Currency Currency { get; set; }

        /// <summary>
        /// Country where this service is available
        /// </summary>
        public Country? Country { get; set; }

        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public Guid? ProviderId { get; set; }

        /// <summary>
        /// Estimated duration in minutes
        /// </summary>
        public int? EstimatedDuration { get; set; }

        /// <summary>
        /// Service image URLs (comma-separated)
        /// </summary>
        public string ImageUrls { get; set; }

        public Service() { }

        public Service(string name, string description, string category, decimal price, Currency currency = Currency.SAR, bool isActive = true)
        {
            Name = name;
            Description = description;
            Category = category;
            Price = price;
            Currency = currency;
            IsActive = isActive;
        }
    }
} 