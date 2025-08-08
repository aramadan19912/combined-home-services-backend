using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace HomeServicesApp
{
    public class Service : FullAuditedAggregateRoot<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public Guid? ProviderId { get; set; }

        public Service() { }

        public Service(string name, string description, string category, decimal price, bool isActive = true)
        {
            Name = name;
            Description = description;
            Category = category;
            Price = price;
            IsActive = isActive;
        }
    }
} 